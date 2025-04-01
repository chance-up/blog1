import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    const recentPosts = await prisma.post.findMany({
      where: {
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

    return NextResponse.json(recentPosts)
  } catch (error) {
    console.error('Error fetching recent posts:', error)
    return NextResponse.json({ error: 'Failed to fetch recent posts' }, { status: 500 })
  }
}
