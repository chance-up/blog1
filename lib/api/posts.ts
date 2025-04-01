import { api } from './client'

// 포스트 타입 정의
export type Post = {
  id: string
  title: string
  content: string
  slug: string
  excerpt?: string
  date: string
  author?: string
  tags: string[]
  published: boolean
  featured?: boolean
  coverImage?: string
  categoryId?: string
}

// 포스트 생성 데이터 타입
export type CreatePostData = Omit<Post, 'id'>

/**
 * 새 블로그 포스트 생성
 */
export async function createPost(postData: CreatePostData) {
  return api.post<{ post: Post }>('/api/posts', postData, { requireAuth: true })
}

/**
 * 포스트 목록 가져오기
 */
export async function getPosts(params?: {
  published?: boolean
  categoryId?: string
  featured?: boolean
  tag?: string
  page?: number
  limit?: number
}) {
  // 쿼리 파라미터 구성
  const queryParams = new URLSearchParams()

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value))
      }
    })
  }

  const queryString = queryParams.toString()
  const endpoint = `/api/posts${queryString ? `?${queryString}` : ''}`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return api.get<{ posts: Post[]; pagination: any }>(endpoint)
}

/**
 * 특정 포스트 가져오기 (ID 기준)
 */
export async function getPostById(id: string) {
  return api.get<Post>(`/api/posts/${id}`)
}

/**
 * 특정 포스트 가져오기 (슬러그 기준)
 */
export async function getPostBySlug(slug: string) {
  return api.get<{ posts: Post[] }>(`/api/posts?slug=${slug}`)
}

/**
 * 포스트 업데이트
 */
export async function updatePost(id: string, postData: Partial<Post>) {
  return api.put<{ post: Post }>(`/api/posts/${id}`, postData, { requireAuth: true })
}

/**
 * 포스트 삭제
 */
export async function deletePost(id: string) {
  return api.delete<{ success: boolean }>(`/api/posts/${id}`, { requireAuth: true })
}

/**
 * 최근 포스트 가져오기
 */
export async function getRecentPosts(limit: number = 5) {
  return api.get<Post[]>(`/api/posts/recent?limit=${limit}`)
}

/**
 * 추천 포스트 가져오기
 */
export async function getFeaturedPosts(limit: number = 5) {
  return api.get<Post[]>(`/api/posts/featured?limit=${limit}`)
}
