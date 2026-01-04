import { Loader2 } from 'lucide-react'
import { P } from './ui/typography'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  return (
    <div className='flex flex-col items-center justify-center gap-2'>
      <Loader2 className={`${sizeClasses[size]} animate-spin`} />
      {text && (
        <P className='text-sm'>{text}</P>
      )}
    </div>
  )
}
