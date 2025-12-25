import { Card } from '@workspace/ui/components/card'

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className || ''}`}
    />
  )
}

export function TournamentCardSkeleton() {
  return (
    <Card className='min-w-72 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'>
      <div className='p-6 space-y-6'>
        {/* Header with badge */}
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              <Skeleton className='h-7 w-48' />
              <Skeleton className='h-5 w-16 rounded' />
            </div>
          </div>
        </div>

        {/* Date and Location */}
        <div className='space-y-2'>
          <Skeleton className='h-5 w-40' />
          <Skeleton className='h-5 w-32' />
        </div>

        {/* Description */}
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-8 w-20' />
        </div>

        {/* Button */}
        <Skeleton className='h-10 w-full' />
      </div>
    </Card>
  )
}

interface TournamentCardsSkeletonProps {
  count?: number
}

export function TournamentCardsSkeleton({ count = 6 }: TournamentCardsSkeletonProps) {
  return (
    <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-6'>
      {Array.from({ length: count }).map((_, i) => (
        <TournamentCardSkeleton key={i} />
      ))}
    </div>
  )
}
