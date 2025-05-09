FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 소스 코드 복사 (전체 코드를 먼저 복사)
COPY . .

# Corepack 활성화 및 의존성 설치
RUN corepack enable && \
  if [ -f yarn.lock ]; then yarn install; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Prisma 클라이언트 생성
RUN yarn prisma generate

# 애플리케이션 빌드
RUN yarn build

# 프로덕션 이미지
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 시스템 의존성 설치
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드 결과물 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# 사용자 권한 설정
USER nextjs

# 환경 변수 설정
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 애플리케이션 실행
CMD ["node", "server.js"]