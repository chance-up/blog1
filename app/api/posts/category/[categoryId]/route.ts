import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/prisma'

export async function GET(request: Request, { params }: { params: { categoryId: string } }) {
  try {
    const categoryId = params.categoryId
    const { searchParams } = new URL(request.url)

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get posts in the specified category
    const posts = await prisma.post.findMany({
      where: {
        categoryId,
        published: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
      skip,
      take: limit,
    })

    // Get total count for pagination
    const total = await prisma.post.count({
      where: {
        categoryId,
        published: true,
      },
    })

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching posts by category:', error)
    return NextResponse.json({ error: 'Failed to fetch posts by category' }, { status: 500 })
  }
}
