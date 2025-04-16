import { notFound } from 'next/navigation'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from '@/components/MDXComponents'
import { genPageMetadata } from 'app/seo'
import PostLayout from '@/layouts/PostLayout'
import PostSimple from '@/layouts/PostSimple'
import PostBanner from '@/layouts/PostBanner'
import { compileMDX } from 'next-mdx-remote/rsc'
import matter from 'gray-matter'

const defaultLayout = 'PostLayout'
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
}

export const metadata = genPageMetadata({ title: 'Blog Post' })

async function getPostFromSlug(slug: string[]) {
  try {
    // Make sure we have a valid base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const slugString = slug.join('/')

    // 포스트 API를 사용하여 slug로 포스트 가져오기
    const response = await fetch(`${baseUrl}/api/posts?slug=${slugString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    // 포스트가 없거나 배열이 비어있는 경우
    if (!data.posts || data.posts.length === 0) {
      return null
    }

    const post = data.posts[0]

    // gray-matter를 사용하여 frontmatter와 content 분리
    // 데이터베이스에서 가져온 content에 frontmatter가 포함되어 있다고 가정
    const { data: frontmatter, content } = matter(post.content)

    return {
      content,
      frontmatter: {
        ...frontmatter,
        title: post.title || frontmatter.title,
        slug: slugString,
        path: `blog1/${slugString}`,
        date: post.date || frontmatter.date || new Date().toISOString(),
        layout: frontmatter.layout || defaultLayout,
        authors: frontmatter.authors || [],
        excerpt: post.excerpt || frontmatter.description,
        tags: post.tags || frontmatter.tags || [],
      },
    }
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export default async function BlogPost({ params }: { params: { slug: string[] } }) {
  // Await params if it's a Promise
  const resolvedParams = await params
  const slug = resolvedParams.slug

  if (!slug) {
    return notFound()
  }

  const post = await getPostFromSlug(slug)
  // console.log(post)

  if (!post) {
    return notFound()
  }

  const { content, frontmatter } = post
  console.log(content)
  const Layout = layouts[frontmatter.layout || defaultLayout]

  // MDX 컴파일
  // const { content: mdxContent } = await compileMDX({
  //   source: content,
  //   components,
  //   options: {
  //     parseFrontmatter: false,
  //   },
  // })

  const { content: mdxContent } = await compileMDX({
    source: content,
    components,
    options: {
      parseFrontmatter: false,
    },
  })

  return (
    <>
      <Layout content={frontmatter} authorDetails={frontmatter.authors || []}>
        {mdxContent}
      </Layout>
    </>
  )
}

export async function generateStaticParams() {
  // 여기서는 정적 경로를 생성하는 로직을 구현할 수 있습니다.
  // 예를 들어, 모든 블로그 포스트의 slug를 반환합니다.
  // 이 예제에서는 간단하게 빈 배열을 반환합니다.
  return []
}
