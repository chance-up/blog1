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
  summary?: string
}

export type GetPostsRequest = {
  page: number
  limit: number
  published?: boolean
  categoryId?: string
  featured?: boolean
  tag?: string
}

export type GetPostsResponse = {
  posts: Post[]
  total: number
}
