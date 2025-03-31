import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // URL에서 id 파라미터 추출
    const url = new URL(request.url)
    const id = url.searchParams.get('id') || 'default-id'

    // frontmatter를 포함한 정적인 MDX 예시 문자열
    const sampleMdxContent = `---
title: "MDX 샘플 문서 ${id}"
description: "MDX와 frontmatter 사용 예시"
date: "2023-11-15"
author: "개발자"
tags: ["MDX", "React", "Next.js"]
layout: "PostLayout"
---

# 샘플 MDX 문서 (ID: ${id})

이것은 정적인 MDX 예시입니다.

## 기능 소개

MDX는 **마크다운**에 JSX를 추가한 형식입니다.

\`\`\`jsx
// 이런 식으로 코드 블록을 포함할 수 있습니다
function Button() {
  return <button>클릭하세요</button>;
}
\`\`\`

### 리스트 예시
- 항목 1
- 항목 2
- 항목 3

> 인용구도 사용할 수 있습니다.

![이미지 설명](https://example.com/image.jpg)

<div className="custom-component">
  이렇게 JSX 컴포넌트를 마크다운 안에 넣을 수 있습니다.
</div>
<button className="cursor-pointer p-4 bg-blue-500 text-white rounded-md">
tttt
</button>
`

    // MDX 콘텐츠 반환
    return NextResponse.json({ content: sampleMdxContent })
  } catch (error) {
    console.error('Error fetching MDX:', error)
    return NextResponse.json({ error: 'Failed to fetch MDX content' }, { status: 500 })
  }
}

// POST 메서드도 추가하여 양쪽 모두 지원
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const slug = body.slug || 'default-slug'

    // frontmatter를 포함한 정적인 MDX 예시 문자열
    const sampleMdxContent = `---
title: "MDX 샘플 문서 ${slug}"
description: "MDX와 frontmatter 사용 예시"
date: "2023-11-15"
author: "개발자"
tags: ["MDX", "React", "Next.js"]
layout: "PostLayout"
---

# 샘플 MDX 문서 (Slug: ${slug})

이것은 정적인 MDX 예시입니다.

## 기능 소개

MDX는 **마크다운**에 JSX를 추가한 형식입니다.

\`\`\`jsx
// 이런 식으로 코드 블록을 포함할 수 있습니다
function Button() {
  return <button>클릭하세요</button>;
}
\`\`\`

### 리스트 예시
- 항목 1
- 항목 2
- 항목 3

> 인용구도 사용할 수 있습니다.

![이미지 설명](https://example.com/image.jpg)

<div className="custom-component">
  이렇게 JSX 컴포넌트를 마크다운 안에 넣을 수 있습니다.
</div>
`

    // MDX 콘텐츠 반환
    return NextResponse.json({ content: sampleMdxContent })
  } catch (error) {
    console.error('Error fetching MDX:', error)
    return NextResponse.json({ error: 'Failed to fetch MDX content' }, { status: 500 })
  }
}
