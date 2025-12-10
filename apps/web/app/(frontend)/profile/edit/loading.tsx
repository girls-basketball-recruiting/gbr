import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'

export default function ProfileEditLoading() {
  return (
    <div className='min-h-svh bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12'>
      <div className='container mx-auto px-4 max-w-3xl'>
        {/* Header skeleton */}
        <div className='text-center mb-8'>
          <div className='h-9 bg-slate-700 animate-pulse rounded mx-auto mb-2 w-2/3' />
          <div className='h-6 bg-slate-700 animate-pulse rounded mx-auto w-1/2' />
        </div>

        {/* Form card skeleton */}
        <Card className='bg-slate-800 border-slate-700'>
          <CardHeader>
            <div className='h-7 bg-slate-700 animate-pulse rounded mb-2 w-1/3' />
            <div className='h-5 bg-slate-700 animate-pulse rounded w-2/3' />
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Form fields skeleton */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className='space-y-2'>
                <div className='h-4 bg-slate-700 animate-pulse rounded w-1/4' />
                <div className='h-10 bg-slate-700 animate-pulse rounded' />
              </div>
            ))}

            {/* Buttons skeleton */}
            <div className='flex gap-3'>
              <div className='flex-1 h-10 bg-slate-700 animate-pulse rounded' />
              <div className='h-10 w-24 bg-slate-700 animate-pulse rounded' />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
