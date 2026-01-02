'use client'

import { Mail, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

interface CopyableEmailProps {
  email: string
}

export function CopyableEmail({ email }: CopyableEmailProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      toast.success('Email copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy email')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className='inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors'
    >
      <Mail className='w-4 h-4' />
      <span>{email}</span>
      {copied ? (
        <Check className='w-3.5 h-3.5 text-green-600 dark:text-green-400' />
      ) : (
        <Copy className='w-3.5 h-3.5' />
      )}
    </button>
  )
}
