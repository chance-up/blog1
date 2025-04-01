import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/prisma'
import jwt from 'jsonwebtoken'
import { verifyAdminToken } from '@/lib/auth/utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Query parameters for filtering
    const published = searchParams.get('published')
    const categoryId = searchParams.get('categoryId')
    const featured = searchParams.get('featured')
    const tag = searchParams.get('tag')

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build filter object
    const filter: Record<string, unknown> = {}

    if (published !== null) {
      filter.published = published === 'true'
    }

    if (categoryId) {
      filter.categoryId = categoryId
    }

    if (featured !== null) {
      filter.featured = featured === 'true'
    }

    if (tag) {
      filter.tags = {
        has: tag,
      }
    }

    // Get posts with pagination
    const posts = await prisma.post.findMany({
      where: filter,
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
    const total = await prisma.post.count({ where: filter })

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
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // 관리자 권한 검증
    const { isAdmin, error } = await verifyAdminToken(request)

    if (!isAdmin) {
      return Response.json(
        {
          success: false,
          message: error?.message,
        },
        { status: error?.status }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.content || !body.slug) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug: body.slug },
    })

    if (existingPost) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        slug: body.slug,
        excerpt: body.excerpt,
        date: body.date ? new Date(body.date) : new Date(),
        published: body.published ?? false,
        featured: body.featured ?? false,
        author: body.author,
        tags: body.tags || [],
        coverImage: body.coverImage,
        categoryId: body.categoryId,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
