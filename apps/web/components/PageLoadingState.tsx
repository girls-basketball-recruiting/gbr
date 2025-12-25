import { LoadingSpinner } from '@/components/LoadingSpinner'

interface PageLoadingStateProps {
  message?: string
}

export function PageLoadingState({ message = 'Loading...' }: PageLoadingStateProps) {
  return (
    <div className='flex items-center justify-center min-h-[calc(100vh-4rem)]'>
      <LoadingSpinner size='lg' text={message} />
    </div>
  )
}
