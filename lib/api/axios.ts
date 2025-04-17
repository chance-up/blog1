import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// 기본 URL 설정 함수
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
}

// Axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 설정
axiosInstance.interceptors.request.use(
  (config) => {
    // 브라우저 환경에서만 localStorage 접근
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken')
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// // 응답 인터셉터 설정
// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response
//   },
//   (error) => {
//     // 401 에러 처리 (인증 실패)
//     if (error.response && error.response.status === 401) {
//       // 브라우저 환경에서만 localStorage 접근
//       if (typeof window !== 'undefined') {
//         localStorage.removeItem('adminToken')
//         // 로그인 페이지로 리디렉션 (필요시 활성화)
//         // window.location.href = '/admin/login'
//       }
//     }
//     return Promise.reject(error)
//   }
// )

// API 응답 타입 정의
export type ApiResponse<T> = {
  data: T | null
  error: string | null
  status: number
}

export default axiosInstance
