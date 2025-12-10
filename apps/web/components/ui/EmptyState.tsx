import { Card } from '@workspace/ui/components/card'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const defaultIcon = (
    <svg
      className='w-10 h-10 text-slate-500'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
      />
    </svg>
  )

  return (
    <Card className='bg-slate-800/50 border-slate-700 p-12'>
      <div className='text-center space-y-4'>
        <div className='w-20 h-20 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center'>
          {icon || defaultIcon}
        </div>
        <h4 className='text-xl font-semibold text-white'>{title}</h4>
        <p className='text-slate-400 max-w-md mx-auto'>{description}</p>
        {action && <div className='mt-4'>{action}</div>}
      </div>
    </Card>
  )
}
