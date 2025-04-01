'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MDXEditor from '@/components/MDXEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { compileMDX } from 'next-mdx-remote/rsc'
import { components } from '@/components/MDXComponents'
import React from 'react'
import { slug } from 'github-slugger'

export default function CreatePost() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [frontMatter, setFrontMatter] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    author: '',
    tags: '',
    layout: 'PostLayout',
    slug: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [compiledContent, setCompiledContent] = useState<React.ReactNode | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [autoSlug, setAutoSlug] = useState(true)

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    // 내용이 변경되면 미리보기가 표시 중일 때 컴파일된 콘텐츠를 초기화
    if (showPreview) {
      setCompiledContent(null)
    }
  }

  const handleFrontMatterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFrontMatter((prev) => ({
      ...prev,
      [name]: value,
    }))

    // 제목이 변경되고 자동 슬러그 생성이 활성화된 경우 슬러그 자동 생성
    if (name === 'title' && autoSlug) {
      const generatedSlug = value ? slug(value) : ''
      setFrontMatter((prev) => ({
        ...prev,
        slug: generatedSlug,
      }))
    }

    // 슬러그 필드가 수동으로 수정된 경우 자동 생성 비활성화
    if (name === 'slug') {
      setAutoSlug(false)
    }
  }

  // 자동 슬러그 생성 토글 함수
  const toggleAutoSlug = () => {
    const newAutoSlug = !autoSlug
    setAutoSlug(newAutoSlug)

    // 자동 슬러그가 다시 활성화되면 현재 제목으로 슬러그 업데이트
    if (newAutoSlug && frontMatter.title) {
      setFrontMatter((prev) => ({
        ...prev,
        slug: slug(frontMatter.title),
      }))
    }
  }

  const handleSave = async () => {
    try {
      if (!frontMatter.title || !frontMatter.slug || !content) {
        alert('제목, 슬러그, 내용은 필수 입력 항목입니다.')
        return
      }

      setIsSaving(true)

      // 태그 처리
      const tagsArray = frontMatter.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag)

      // API 요청 데이터 준비
      const postData = {
        title: frontMatter.title,
        content: content,
        slug: frontMatter.slug,
        excerpt: frontMatter.description, // description을 excerpt로 사용
        date: frontMatter.date,
        author: frontMatter.author,
        tags: tagsArray,
        published: true, // 기본값으로 true 설정 (필요에 따라 변경 가능)
        // 추가 필드가 필요하면 여기에 추가
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save content')
      }

      alert('포스트가 성공적으로 저장되었습니다!')
      router.push(`/blog1/${frontMatter.slug}`)
    } catch (error) {
      console.error('Error saving content:', error)
      alert(
        '포스트 저장에 실패했습니다: ' + (error instanceof Error ? error.message : String(error))
      )
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">새 블로그 포스트 작성</h1>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="title" className="mb-2 block">
            제목 (필수)
          </Label>
          <Input
            id="title"
            name="title"
            value={frontMatter.title}
            onChange={handleFrontMatterChange}
            placeholder="포스트 제목"
            className="w-full"
            required
          />
        </div>

        <div>
          <Label htmlFor="slug" className="mb-2 block">
            슬러그 (필수)
          </Label>
          <div className="flex gap-2">
            <Input
              id="slug"
              name="slug"
              value={frontMatter.slug}
              onChange={handleFrontMatterChange}
              placeholder="my-post-slug"
              className="w-full"
              required
            />
            <Button
              type="button"
              onClick={toggleAutoSlug}
              variant={autoSlug ? 'default' : 'outline'}
              className="whitespace-nowrap"
            >
              {autoSlug ? '자동 생성 켜짐' : '자동 생성 꺼짐'}
            </Button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            URL에 사용될 고유 식별자입니다. 제목에서 자동 생성됩니다.
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="date" className="mb-2 block">
            날짜
          </Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={frontMatter.date}
            onChange={handleFrontMatterChange}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="author" className="mb-2 block">
            작성자
          </Label>
          <Input
            id="author"
            name="author"
            value={frontMatter.author}
            onChange={handleFrontMatterChange}
            placeholder="작성자 이름"
            className="w-full"
          />
        </div>
      </div>

      <div className="mb-6">
        <Label htmlFor="description" className="mb-2 block">
          설명
        </Label>
        <Textarea
          id="description"
          name="description"
          value={frontMatter.description}
          onChange={handleFrontMatterChange}
          placeholder="포스트에 대한 간단한 설명"
          className="w-full"
          rows={3}
        />
      </div>

      <div className="mb-6">
        <Label htmlFor="tags" className="mb-2 block">
          태그 (쉼표로 구분)
        </Label>
        <Input
          id="tags"
          name="tags"
          value={frontMatter.tags}
          onChange={handleFrontMatterChange}
          placeholder="next.js, react, tutorial"
          className="w-full"
        />
      </div>

      <div className="mb-6">
        <Label htmlFor="layout" className="mb-2 block">
          레이아웃
        </Label>
        <select
          id="layout"
          name="layout"
          value={frontMatter.layout}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const { name, value } = e.target
            setFrontMatter((prev) => ({ ...prev, [name]: value }))
          }}
          className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="PostLayout">PostLayout</option>
          <option value="PostSimple">PostSimple</option>
          <option value="PostBanner">PostBanner</option>
        </select>
      </div>

      <div className="mb-4 flex justify-between">
        <h2 className="text-xl font-bold">내용</h2>
        <Button onClick={togglePreview} variant="outline" className="mb-4" disabled={isCompiling}>
          {showPreview ? '에디터 보기' : '미리보기'}
        </Button>
      </div>

      {showPreview ? (
        <div className="min-h-[400px] rounded-md border border-gray-300 p-4 dark:border-gray-700">
          {isCompiling ? (
            <div className="flex h-full items-center justify-center">
              <p>미리보기 생성 중...</p>
            </div>
          ) : (
            compiledContent || (
              <div className="flex h-full items-center justify-center">
                <p>미리보기를 생성하려면 내용을 입력하세요</p>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="mb-6 min-h-[400px] rounded-md border border-gray-300 dark:border-gray-700">
          <MDXEditor markdown={content} onChange={handleContentChange} />
        </div>
      )}

      <div className="mt-6 flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isSaving}
          className="px-6"
        >
          취소
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="px-6">
          {isSaving ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  )
}
