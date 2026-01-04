import { LoadingSpinner } from '@/components/LoadingSpinner'

interface PageLoadingStateProps {
  message?: string
}

export function PageLoadingState({ message = 'Loading...' }: PageLoadingStateProps) {
  return (
    <div className='flex items-center justify-center mt-20'>
      <LoadingSpinner text={message} />
    </div>
  )
}
