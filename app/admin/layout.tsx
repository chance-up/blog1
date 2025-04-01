'use client'

import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // 로그인 페이지가 아니고, 로딩이 끝났는데 사용자가 없거나 관리자가 아닌 경우
  useEffect(() => {
    if (!loading && !pathname.includes('/admin/login')) {
      if (!user) {
        router.push('/admin/login')
      } else if (!isAdmin) {
        // 사용자는 로그인했지만 관리자가 아닌 경우
        logout()
        router.push('/admin/login?error=unauthorized')
      }
    }
  }, [user, loading, isAdmin, pathname, router, logout])

  // 로그인 페이지인 경우 레이아웃 없이 바로 컨텐츠 표시
  if (pathname === '/admin/login') {
    return children
  }

  // 로딩 중이거나 사용자가 없는 경우 로딩 표시
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p>인증 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* 사이드바 */}
      <div className="w-64 bg-white shadow-md dark:bg-gray-800">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">관리자 대시보드</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li>
              <Link
                href="/admin"
                className={`block px-6 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
                  pathname === '/admin' ? 'bg-gray-100 font-medium dark:bg-gray-700' : ''
                }`}
              >
                대시보드
              </Link>
            </li>
            <li>
              <Link
                href="/admin/posts"
                className={`block px-6 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
                  pathname.startsWith('/admin/posts')
                    ? 'bg-gray-100 font-medium dark:bg-gray-700'
                    : ''
                }`}
              >
                게시물 관리
              </Link>
            </li>
            <li>
              <Link
                href="/admin/categories"
                className={`block px-6 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
                  pathname.startsWith('/admin/categories')
                    ? 'bg-gray-100 font-medium dark:bg-gray-700'
                    : ''
                }`}
              >
                카테고리 관리
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className={`block px-6 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
                  pathname.startsWith('/admin/users')
                    ? 'bg-gray-100 font-medium dark:bg-gray-700'
                    : ''
                }`}
              >
                사용자 관리
              </Link>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 border-t border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 p-8">{children}</div>
    </div>
  )
}
