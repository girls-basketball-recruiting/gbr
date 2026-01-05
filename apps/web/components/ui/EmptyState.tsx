import { Card } from '@workspace/ui/components/card'
import { ReactNode } from 'react'
import { H4, P } from './typography'
import { SearchIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className='p-12 bg-accent border-accent-card'>
      <div className='text-center space-y-6'>
        <div className='w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-card border border-accent-card'>
          {icon || <SearchIcon className='w-8 h-8' />}
        </div>
        <H4>{title}</H4>
        <P className='max-w-md mx-auto'>{description}</P>
        {action && <div className='mt-4'>{action}</div>}
      </div>
    </Card>
  )
}
