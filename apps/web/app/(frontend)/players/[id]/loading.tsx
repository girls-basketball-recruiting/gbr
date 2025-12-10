import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'

export default function PlayerProfileLoading() {
  return (
    <div className='min-h-svh bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12'>
      <div className='container mx-auto px-4 max-w-6xl'>
        {/* Back button skeleton */}
        <div className='mb-6'>
          <div className='h-10 w-24 bg-slate-700 animate-pulse rounded' />
        </div>

        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Profile card skeleton */}
          <div className='lg:col-span-1'>
            <Card className='bg-slate-800 border-slate-700'>
              <CardHeader>
                <div className='h-8 bg-slate-700 animate-pulse rounded mb-2' />
                <div className='h-4 bg-slate-700 animate-pulse rounded w-2/3' />
              </CardHeader>
              <CardContent className='space-y-4'>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className='space-y-2'>
                    <div className='h-4 bg-slate-700 animate-pulse rounded w-1/3' />
                    <div className='h-4 bg-slate-700 animate-pulse rounded w-2/3' />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Notes section skeleton */}
          <div className='lg:col-span-2'>
            <Card className='bg-slate-800 border-slate-700'>
              <CardHeader>
                <div className='h-8 bg-slate-700 animate-pulse rounded mb-2' />
                <div className='h-4 bg-slate-700 animate-pulse rounded w-2/3' />
              </CardHeader>
              <CardContent className='space-y-6'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='space-y-3'>
                    <div className='h-4 bg-slate-700 animate-pulse rounded w-1/4' />
                    <div className='h-10 bg-slate-700 animate-pulse rounded' />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
