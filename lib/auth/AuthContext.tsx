'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  name: string
  email: string
  role: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 페이지 로드 시 로컬 스토리지에서 사용자 정보 확인
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        // 로컬 스토리지에서 토큰 확인
        const token = localStorage.getItem('adminToken')

        if (token) {
          // 토큰이 있으면 사용자 정보 가져오기
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
          const response = await fetch(`${baseUrl}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const userData = await response.json()
            setUser(userData.user)
          } else {
            // 토큰이 유효하지 않으면 로그아웃
            localStorage.removeItem('adminToken')
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUserLoggedIn()
  }, [])

  // 로그인 함수
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()

      // 토큰 저장
      localStorage.setItem('adminToken', data.token)

      // 사용자 정보 설정
      setUser(data.user)
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('adminToken')
    setUser(null)
    router.push('/admin/login')
  }

  // 관리자 여부 확인
  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

// 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
