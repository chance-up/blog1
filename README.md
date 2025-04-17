# 관리자 계정 생성

npx ts-node --esm scripts/create-admin.ts

# 개발 환경에서 빠른 적용 (prisma db push)

개발 환경에서 빠르게 변경사항을 적용하고 싶을 때 사용합니다:
이 명령어는 마이그레이션 기록을 남기지 않고 스키마 변경사항을 데이터베이스에 바로 적용합니다. 개발 중이거나 프로토타이핑할 때 유용합니다.

```
npx prisma db push
```

# 프로덕션 환경을 위한 마이그레이션 (prisma migrate)

프로덕션 환경에서는 마이그레이션 기록을 남기는 것이 중요합니다:
migrate dev 명령어는:
마이그레이션 SQL 파일을 생성합니다 (prisma/migrations 폴더에 저장)
데이터베이스에 변경사항을 적용합니다
Prisma 클라이언트를 재생성합니다

```
# 마이그레이션 파일 생성
npx prisma migrate dev --name 변경_내용_설명

# 프로덕션 환경에서 적용
npx prisma migrate deploy


```

# 추가 작업

스키마 변경 후에는 항상 Prisma 클라이언트를 재생성해야 합니다:
이 명령어는 migrate dev를 실행할 때 자동으로 실행됩니다.

```
npx prisma generate
```
