import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    const featuredPosts = await prisma.post.findMany({
      where: {
        featured: true,
        published: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: limit,
    })

    return NextResponse.json(featuredPosts)
  } catch (error) {
    console.error('Error fetching featured posts:', error)
    return NextResponse.json({ error: 'Failed to fetch featured posts' }, { status: 500 })
  }
}
