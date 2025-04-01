'use client'

import { useAuth } from '@/lib/auth/AuthContext'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    categories: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/admin/stats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">관리자 대시보드</h1>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">환영합니다, {user?.name}님!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          블로그 관리 시스템에 접속하셨습니다. 왼쪽 메뉴에서 관리할 항목을 선택하세요.
        </p>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-medium">총 게시물</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalPosts}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-medium">공개 게시물</h3>
            <p className="text-3xl font-bold text-green-600">{stats.publishedPosts}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-medium">임시 저장 게시물</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.draftPosts}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-medium">카테고리</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.categories}</p>
          </div>
        </div>
      )}
    </div>
  )
}
