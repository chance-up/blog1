import React from 'react'
import Link from 'next/link'

// 서버 컴포넌트로 API 데이터 가져오기
async function getPosts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/posts?published=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // 항상 최신 데이터 가져오기
    })

    if (!response.ok) {
      throw new Error('Failed to fetch posts')
    }

    const data = await response.json()
    return data.posts || []
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="mb-2 text-4xl font-bold">블로그</h1>
        <p className="text-gray-600">최신 블로그 포스트를 확인하세요</p>
        <Link
          href="/blog1/create"
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white transition duration-300 hover:bg-blue-700"
        >
          글 작성하기
        </Link>
      </header>

      <main>
        {posts.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500">아직 작성된 블로그 포스트가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="transform rounded-lg border border-gray-200 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {JSON.stringify(post.slug)}
                <h2 className="mb-2 text-xl font-semibold">{post.title}</h2>
                <p className="mb-4 text-sm text-gray-500">
                  {new Date(post.date).toLocaleDateString('ko-KR')}
                </p>
                <p className="mb-4 text-gray-700">{post.excerpt || '내용 없음'}</p>
                <Link
                  href={`/blog1/${post.slug}`}
                  className="inline-block text-blue-600 hover:underline"
                >
                  더 읽기 &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
