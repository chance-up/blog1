import React from 'react'
import Link from 'next/link'

// 임시 블로그 포스트 데이터
const blogPosts = [
  {
    id: 1,
    title: '첫 번째 블로그 포스트',
    excerpt: '이것은 첫 번째 블로그 포스트의 요약입니다. 흥미로운 내용이 담겨 있습니다.',
    date: '2023-11-15',
  },
  {
    id: 2,
    title: '두 번째 블로그 포스트',
    excerpt: '두 번째 블로그 포스트입니다. 더 많은 정보를 제공합니다.',
    date: '2023-11-20',
  },
  {
    id: 3,
    title: '세 번째 블로그 포스트',
    excerpt: '세 번째 블로그 포스트입니다. 가장 최신의 내용을 담고 있습니다.',
    date: '2023-11-25',
  },
]

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="mb-2 text-4xl font-bold">블로그</h1>
        <p className="text-gray-600">최신 블로그 포스트를 확인하세요</p>
      </header>

      <main>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="transform rounded-lg border border-gray-200 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <h2 className="mb-2 text-xl font-semibold">{post.title}</h2>
              <p className="mb-4 text-sm text-gray-500">{post.date}</p>
              <p className="mb-4 text-gray-700">{post.excerpt}</p>
              <Link
                href={`/blog1/${post.id}`}
                className="inline-block text-blue-600 hover:underline"
              >
                더 읽기 &rarr;
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
