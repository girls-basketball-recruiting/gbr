'use client'

import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { ReactNode, useState } from 'react'

interface CopyableTextProps {
  icon?: ReactNode
  text: string
  successMsg: string
  errorMsg: string
}

export function CopyableText({ icon, text, successMsg, errorMsg }: CopyableTextProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(successMsg)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(errorMsg)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent-foreground'
    >
      { icon }
      <span>{text}</span>
      {copied ? (
        <Check className='w-3.5 h-3.5 text-green-600 dark:text-green-400' />
      ) : (
        <Copy className='w-3.5 h-3.5' />
      )}
    </button>
  )
}
