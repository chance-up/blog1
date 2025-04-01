/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API 요청을 위한 공통 클라이언트
 */

// API 기본 URL 설정
const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// API 요청 옵션 타입 정의
type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
  requireAuth?: boolean
  cache?: RequestCache
}

// API 응답 타입 정의
type ApiResponse<T> = {
  data: T | null
  error: string | null
  status: number
}

/**
 * API 요청을 보내는 공통 함수
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const { method = 'GET', body, headers = {}, requireAuth = false, cache } = options

    // 기본 헤더 설정
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    }

    // 인증이 필요한 경우 토큰 추가
    if (requireAuth) {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        return {
          data: null,
          error: '인증 토큰이 없습니다. 다시 로그인해주세요.',
          status: 401,
        }
      }
      requestHeaders['Authorization'] = `Bearer ${token}`
    }

    // 요청 옵션 구성
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      cache,
    }

    // GET 요청이 아닌 경우 body 추가
    if (method !== 'GET' && body) {
      requestOptions.body = JSON.stringify(body)
    }

    // API 요청 실행
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}${endpoint}`, requestOptions)

    // JSON 응답 파싱
    const data = await response.json()

    if (!response.ok) {
      return {
        data: null,
        error: data.error || `요청 실패: ${response.status}`,
        status: response.status,
      }
    }

    return {
      data,
      error: null,
      status: response.status,
    }
  } catch (error) {
    console.error('API 요청 오류:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      status: 500,
    }
  }
}

/**
 * 편의성을 위한 HTTP 메서드별 래퍼 함수들
 */
export const api = {
  get: <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body: any, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body: any, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  delete: <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T>(endpoint: string, body: any, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),
}
