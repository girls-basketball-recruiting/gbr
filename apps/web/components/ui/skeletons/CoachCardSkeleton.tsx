import { Card } from '@workspace/ui/components/card'

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className || ''}`}
    />
  )
}

export function CoachCardSkeleton() {
  return (
    <Card className='min-w-72 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'>
      <div className='p-6 space-y-4'>
        <div>
          <Skeleton className='h-7 w-40 mb-2' />
          <Skeleton className='h-4 w-32' />
        </div>

        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-4 w-24' />
          </div>
        </div>

        <Skeleton className='h-16 w-full' />

        <div className='pt-4 flex gap-2'>
          <Skeleton className='h-10 flex-1' />
        </div>
      </div>
    </Card>
  )
}

interface CoachCardsSkeletonProps {
  count?: number
}

export function CoachCardsSkeleton({ count = 3 }: CoachCardsSkeletonProps) {
  return (
    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {Array.from({ length: count }).map((_, i) => (
        <CoachCardSkeleton key={i} />
      ))}
    </div>
  )
}
