'use client'

import { useEffect, useState } from 'react'

export function SafeHtml({
  html,
  className,
}: {
  html: string
  className?: string
}) {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>('')

  useEffect(() => {
    import('dompurify').then((DOMPurify) => {
      setSanitizedHtml(DOMPurify.default.sanitize(html))
    })
  }, [html])

  if (!sanitizedHtml) {
    // Show raw text without HTML during SSR/initial load
    return <div className={className}>{html.replace(/<[^>]*>/g, ' ')}</div>
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
