'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MDXEditor from '@/components/MDXEditor'
import matter from 'gray-matter'
import React from 'react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { compileMDX } from 'next-mdx-remote/rsc'
import { components } from '@/components/MDXComponents'

export default function EditPage({
  params,
}: {
  params: Promise<{ slug: string[] }> | { slug: string[] }
}) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [frontMatter, setFrontMatter] = useState<Record<string, string | string[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [compiledContent, setCompiledContent] = useState<React.ReactNode | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)

  // React.use()를 사용하여 params 언래핑
  const resolvedParams = params instanceof Promise ? React.use(params) : params
  const slug = resolvedParams.slug.join('/')

  useEffect(() => {
    async function fetchContent() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/mdx?id=${slug}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch content')
        }

        const data = await response.json()
        const { data: frontMatter, content: mdxContent } = matter(data.content)

        setFrontMatter(frontMatter)
        setContent(mdxContent)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching content:', error)
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [slug])

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    // 내용이 변경되면 미리보기가 표시 중일 때 컴파일된 콘텐츠를 초기화
    if (showPreview) {
      setCompiledContent(null)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // frontMatter와 content를 합쳐서 MDX 문서 생성
      const mdxContent = `---
${Object.entries(frontMatter)
  .map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key}: [${value.map((v) => `"${v}"`).join(', ')}]`
    }
    return `${key}: "${value}"`
  })
  .join('\n')}
---

${content}`

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/mdx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug, content: mdxContent }),
      })

      if (!response.ok) {
        throw new Error('Failed to save content')
      }

      alert('Content saved successfully!')
      router.push(`/blog1/${slug}`)
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Failed to save content')
    } finally {
      setIsSaving(false)
    }
  }

  // 미리보기 컴파일 함수
  const compilePreview = async () => {
    if (!content) return

    setIsCompiling(true)
    try {
      // compileMDX 함수를 사용하여 클라이언트에서 직접 컴파일
      const { content: compiledContent } = await compileMDX({
        source: content,
        components,
        options: {
          parseFrontmatter: false,
        },
      })

      setCompiledContent(
        <div className="mdx-preview prose dark:prose-invert max-w-none">{compiledContent}</div>
      )
    } catch (error) {
      console.error('Error compiling MDX:', error)
      setCompiledContent(<div className="text-red-500">Error compiling MDX: {String(error)}</div>)
    } finally {
      setIsCompiling(false)
    }
  }

  // 미리보기 토글 처리
  const togglePreview = async () => {
    const newPreviewState = !showPreview
    setShowPreview(newPreviewState)

    if (newPreviewState && !compiledContent) {
      await compilePreview()
    }
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Edit: {frontMatter.title}</h1>

      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Front Matter</h2>
        <div className="rounded-md bg-gray-100 p-4">
          {Object.entries(frontMatter).map(([key, value]) => (
            <div key={key} className="mb-2">
              <span className="font-medium">{key}: </span>
              <span>{JSON.stringify(value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Content</h2>
          <div className="flex gap-2">
            {showPreview && (
              <button
                onClick={compilePreview}
                disabled={isCompiling}
                className="rounded-md bg-green-500 px-3 py-1 text-white hover:bg-green-600 disabled:bg-green-300"
              >
                {isCompiling ? 'Compiling...' : 'Refresh Preview'}
              </button>
            )}
            <button
              onClick={togglePreview}
              className="rounded-md bg-gray-200 px-3 py-1 hover:bg-gray-300"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            className={`rounded-md border border-gray-300 ${showPreview ? 'md:col-span-1' : 'md:col-span-2'}`}
          >
            <MDXEditor markdown={content} onChange={handleContentChange} />
          </div>

          {showPreview && (
            <div className="overflow-auto rounded-md border border-gray-300 bg-white p-4">
              <h3 className="mb-2 text-lg font-medium">Preview</h3>
              {isCompiling ? (
                <div className="flex h-40 items-center justify-center">
                  <span className="animate-pulse">Compiling MDX...</span>
                </div>
              ) : compiledContent ? (
                compiledContent
              ) : (
                <div className="text-gray-500">Click "Refresh Preview" to see the rendered MDX</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}
