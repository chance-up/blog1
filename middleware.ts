import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 관리자 경로인지 확인 (로그인 페이지 제외)
  const isAdminPath =
    request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/login')

  // 쿠키에서 토큰 확인
  const token = request.cookies.get('adminToken')?.value

  // 관리자 경로에 접근하려고 하는데 토큰이 없는 경우
  if (isAdminPath && !token) {
    const loginUrl = new URL('/admin/login', request.url)
    // 로그인 후 원래 페이지로 리디렉션하기 위해 현재 URL을 쿼리 파라미터로 추가
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// 미들웨어가 실행될 경로 지정
export const config = {
  matcher: ['/admin/:path*'],
}
