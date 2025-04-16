// 마크다운 콘텐츠에서 헤딩 추출하는 함수
export function extractHeadings(mdContent: string) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings: { level: number; text: string; slug: string }[] = []
  let match

  while ((match = headingRegex.exec(mdContent)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const slug = text
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, '-') // 한글 지원 추가
      .replace(/^-|-$/g, '')

    headings.push({
      level,
      text,
      slug,
    })
  }

  return headings
}
