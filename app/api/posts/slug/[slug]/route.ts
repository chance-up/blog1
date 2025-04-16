import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/prisma'

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const param = await params
    // 동적 라우트 파라미터에서 slug 가져오기
    const slug = param.slug
    console.log('slug', slug)

    if (!slug) {
      return NextResponse.json({ error: 'Invalid slug parameter' }, { status: 400 })
    }

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // 단일 포스트 객체를 반환하도록 수정 (배열이 아닌)
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post by slug:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
