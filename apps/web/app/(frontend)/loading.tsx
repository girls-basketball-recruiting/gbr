import { Card, CardContent } from '@workspace/ui/components/card'

export default function DashboardLoading() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header skeleton */}
        <div className='flex justify-between items-center mb-8'>
          <div className='h-9 w-64 bg-slate-700 animate-pulse rounded' />
          <div className='h-10 w-32 bg-slate-700 animate-pulse rounded' />
        </div>

        {/* Section title skeleton */}
        <div className='mb-8'>
          <div className='h-8 w-80 bg-slate-700 animate-pulse rounded mb-4' />

          {/* Grid of cards skeleton */}
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className='bg-slate-800/50 border-slate-700'>
                <div className='p-6 space-y-4'>
                  <div>
                    <div className='h-6 bg-slate-700 animate-pulse rounded mb-2 w-3/4' />
                    <div className='h-4 bg-slate-700 animate-pulse rounded w-1/2' />
                  </div>

                  <div className='space-y-2'>
                    {[1, 2, 3].map((j) => (
                      <div key={j} className='flex items-center gap-2'>
                        <div className='h-4 bg-slate-700 animate-pulse rounded w-1/4' />
                        <div className='h-4 bg-slate-700 animate-pulse rounded w-1/2' />
                      </div>
                    ))}
                  </div>

                  <div className='space-y-2'>
                    <div className='h-4 bg-slate-700 animate-pulse rounded w-full' />
                    <div className='h-4 bg-slate-700 animate-pulse rounded w-5/6' />
                    <div className='h-4 bg-slate-700 animate-pulse rounded w-4/5' />
                  </div>

                  <div className='pt-4'>
                    <div className='h-10 bg-slate-700 animate-pulse rounded' />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats section skeleton */}
        <div className='grid md:grid-cols-3 gap-6 mb-8'>
          {[1, 2, 3].map((i) => (
            <Card key={i} className='bg-slate-800/50 border-slate-700 p-6'>
              <div className='text-center'>
                <div className='h-4 bg-slate-700 animate-pulse rounded mb-2 mx-auto w-1/2' />
                <div className='h-10 bg-slate-700 animate-pulse rounded mx-auto w-16' />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
