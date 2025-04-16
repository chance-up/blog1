import { notFound } from 'next/navigation'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { components } from '@/components/MDXComponents'
import { genPageMetadata } from 'app/seo'
import PostLayout from '@/layouts/PostLayout'
import PostSimple from '@/layouts/PostSimple'
import PostBanner from '@/layouts/PostBanner'
import { compileMDX } from 'next-mdx-remote/rsc'
import matter from 'gray-matter'
import rehypeSlug from 'rehype-slug'
import { extractHeadings } from '@/lib/utils'
import { getPostBySlug } from '@/lib/api/posts'

const defaultLayout = 'PostLayout'
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
}

export const metadata = genPageMetadata({ title: 'Blog Post' })

async function getPostFromSlug(slug: string) {
  try {
    const response = await getPostBySlug(slug)
    const post = response.data
    if (!post) {
      return null
    }

    // 포스트가 없거나 배열이 비어있는 경우
    // if (!data.posts || data.posts.length === 0) {
    //   return null
    // }

    // const post = data.posts[0]

    // gray-matter를 사용하여 frontmatter와 content 분리
    // 데이터베이스에서 가져온 content에 frontmatter가 포함되어 있다고 가정
    // console.log(post, '!@#!!2#!@#!@#@!')
    // console.log(post.content, '!@#!!2#!@#!@#@!')
    const { data: frontmatter, content } = matter(post.content)

    return {
      content,
      frontmatter: {
        ...frontmatter,
        title: post.title || frontmatter.title,
        slug: slug,
        path: `blog1/${slug}`,
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

export default async function BlogPost(props: { params: Promise<{ slug: string }> }) {
  // Properly await the params object
  const params = await props.params
  const slug = params.slug
  // console.log(slug)

  if (!slug) {
    return notFound()
  }

  const post = await getPostFromSlug(slug)
  // console.log(post)
  if (!post) {
    return notFound()
  }

  const { content, frontmatter } = post
  console.log(content, '!@#!!2#!@#!@#@!')
  console.log('Frontmatter:', JSON.stringify(frontmatter, null, 2))
  const Layout = layouts[defaultLayout]

  // MDX 컴파일
  try {
    const { content: mdxContent } = await compileMDX({
      source: content || '',
      components,
      options: {
        parseFrontmatter: false,
        mdxOptions: {
          rehypePlugins: [rehypeSlug],
          development: process.env.NODE_ENV === 'development',
        },
      },
    })

    // 목차(TOC) 생성
    const headings = extractHeadings(content || '')

    // Use the Layout component with proper props
    const LayoutComponent = layouts[frontmatter.layout || defaultLayout]

    if (!mdxContent) {
      console.error('MDX content is undefined after compilation')
      return (
        <div className="prose dark:prose-invert mx-auto">
          <h1>Error rendering content</h1>
          <p>The content could not be properly compiled.</p>
        </div>
      )
    }

    // Make sure we pass toc to the mdxContent
    return (
      <>
        {JSON.stringify(mdxContent)}

        <LayoutComponent
          content={{
            filePath: frontmatter.path || '',
            path: frontmatter.path || '',
            slug: frontmatter.slug || '',
            date: frontmatter.date || '',
            title: frontmatter.title || '',
            tags: frontmatter.tags || [],
          }}
          authorDetails={frontmatter.authors || []}
          toc={headings}
        >
          {/* Wrap mdxContent in a context provider that supplies toc */}
          <div className="mdx-wrapper" data-toc-available="true">
            {mdxContent}
          </div>
        </LayoutComponent>
      </>
    )
  } catch (error) {
    console.error('Error compiling MDX:', error)
    return (
      <div className="prose dark:prose-invert mx-auto">
        <h1>Error rendering content</h1>
        <p>There was an error rendering the content. Please try again later.</p>
        <pre>{error.message}</pre>
      </div>
    )
  }
}

// export async function generateStaticParams() {
//   // 여기서는 정적 경로를 생성하는 로직을 구현할 수 있습니다.
//   // 예를 들어, 모든 블로그 포스트의 slug를 반환합니다.
//   // 이 예제에서는 간단하게 빈 배열을 반환합니다.
//   return []
// }
