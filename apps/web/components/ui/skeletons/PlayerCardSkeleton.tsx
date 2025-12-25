import { Card } from '@workspace/ui/components/card'

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className || ''}`}
    />
  )
}

export function PlayerCardSkeleton() {
  return (
    <Card className='overflow-hidden pt-0 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'>
      {/* Square Image */}
      <div className='relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800'>
        {/* Graduation Year Badge */}
        <div className='absolute top-3 right-3'>
          <Skeleton className='h-7 w-12 rounded' />
        </div>

        {/* Bottom Gradient Overlay for Name */}
        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4'>
          <Skeleton className='h-6 w-40 mb-1 bg-white/20' />
          <Skeleton className='h-4 w-24 bg-white/20' />
        </div>
      </div>

      {/* Info Section */}
      <div className='p-4 space-y-3'>
        {/* Stats Row */}
        <div className='grid grid-cols-3 gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg p-3 border border-blue-200 dark:border-blue-800'>
          <div className='text-center'>
            <Skeleton className='h-7 w-12 mx-auto mb-1' />
            <Skeleton className='h-3 w-8 mx-auto' />
          </div>
          <div className='text-center border-x border-blue-200 dark:border-blue-800'>
            <Skeleton className='h-7 w-12 mx-auto mb-1' />
            <Skeleton className='h-3 w-8 mx-auto' />
          </div>
          <div className='text-center'>
            <Skeleton className='h-7 w-12 mx-auto mb-1' />
            <Skeleton className='h-3 w-8 mx-auto' />
          </div>
        </div>

        {/* Key Info - Grid Layout */}
        <div className='grid grid-cols-2 gap-x-3 gap-y-2'>
          <div>
            <Skeleton className='h-3 w-12 mb-1' />
            <Skeleton className='h-4 w-16' />
          </div>
          <div>
            <Skeleton className='h-3 w-12 mb-1' />
            <Skeleton className='h-4 w-12' />
          </div>
          <div className='col-span-2'>
            <Skeleton className='h-3 w-16 mb-1' />
            <Skeleton className='h-4 w-full' />
          </div>
          <div className='col-span-2'>
            <Skeleton className='h-3 w-20 mb-1' />
            <Skeleton className='h-4 w-32' />
          </div>
        </div>

        {/* Actions */}
        <div className='pt-2 flex gap-2 border-t border-slate-200 dark:border-slate-700'>
          <Skeleton className='h-10 flex-1' />
        </div>
      </div>
    </Card>
  )
}

interface PlayerCardsSkeletonProps {
  count?: number
}

export function PlayerCardsSkeleton({ count = 6 }: PlayerCardsSkeletonProps) {
  return (
    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {Array.from({ length: count }).map((_, i) => (
        <PlayerCardSkeleton key={i} />
      ))}
    </div>
  )
}
