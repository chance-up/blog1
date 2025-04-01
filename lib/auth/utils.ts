import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthResult {
  isAdmin: boolean
  userId?: string
  error?: {
    message: string
    status: number
    code?: string
  }
}

export async function verifyAdminToken(request: Request): Promise<AuthResult> {
  // 헤더에서 토큰 추출
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      isAdmin: false,
      error: {
        message: '인증 토큰이 필요합니다.',
        status: 401,
        code: 'AUTH_TOKEN_REQUIRED',
      },
    }
  }

  const token = authHeader.split(' ')[1]

  try {
    // 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string }

    // 관리자 권한 확인
    if (decoded.role !== 'admin') {
      return {
        isAdmin: false,
        userId: decoded.id,
        error: {
          message: '관리자 권한이 필요합니다.',
          status: 403,
          code: 'ADMIN_REQUIRED',
        },
      }
    }

    // 성공적인 인증 결과 반환
    return {
      isAdmin: true,
      userId: decoded.id,
    }
  } catch (tokenError) {
    // 토큰 오류 세분화
    if (tokenError instanceof jwt.TokenExpiredError) {
      return {
        isAdmin: false,
        error: {
          message: '토큰이 만료되었습니다.',
          status: 401,
          code: 'TOKEN_EXPIRED',
        },
      }
    }

    return {
      isAdmin: false,
      error: {
        message: '유효하지 않은 토큰입니다.',
        status: 401,
        code: 'INVALID_TOKEN',
      },
    }
  }
}
