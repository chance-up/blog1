import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if slug is being changed and if it already exists
    if (body.slug && body.slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug: body.slug },
      })

      if (slugExists) {
        return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
      }
    }

    // Prepare update data
    const updateData: any = {}

    // Only include fields that are provided in the request
    if (body.title !== undefined) updateData.title = body.title
    if (body.content !== undefined) updateData.content = body.content
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt
    if (body.date !== undefined) updateData.date = new Date(body.date)
    if (body.published !== undefined) updateData.published = body.published
    if (body.featured !== undefined) updateData.featured = body.featured
    if (body.author !== undefined) updateData.author = body.author
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId

    // Update post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Delete post
    await prisma.post.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
