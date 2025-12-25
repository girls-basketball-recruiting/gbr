import { Card } from '@workspace/ui/components/card'

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className || ''}`}
    />
  )
}

export function ProgramCardSkeleton() {
  return (
    <Card className='min-w-72 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'>
      <div className='p-6 space-y-4'>
        {/* Header */}
        <div className='flex items-start justify-between gap-2'>
          <Skeleton className='h-7 w-48' />
          <Skeleton className='h-6 w-32 rounded-full' />
        </div>

        {/* Program Details */}
        <div className='space-y-2'>
          <Skeleton className='h-5 w-40' />
          <Skeleton className='h-5 w-32' />
          <Skeleton className='h-5 w-24' />
          <Skeleton className='h-4 w-36' />
        </div>

        {/* Action Button */}
        <div className='pt-2'>
          <Skeleton className='h-10 w-full' />
        </div>
      </div>
    </Card>
  )
}

interface ProgramCardsSkeletonProps {
  count?: number
}

export function ProgramCardsSkeleton({ count = 6 }: ProgramCardsSkeletonProps) {
  return (
    <div className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {Array.from({ length: count }).map((_, i) => (
        <ProgramCardSkeleton key={i} />
      ))}
    </div>
  )
}
