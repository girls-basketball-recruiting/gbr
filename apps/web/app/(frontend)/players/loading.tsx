import { Card } from '@workspace/ui/components/card'

export default function PlayersLoading() {
  return (
    <div className='min-h-svh bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12'>
      <div className='container mx-auto px-4'>
        <div className='max-w-7xl mx-auto'>
          {/* Header skeleton */}
          <div className='mb-8'>
            <div className='h-10 w-32 bg-slate-700 animate-pulse rounded mb-4' />
            <div className='h-10 w-64 bg-slate-700 animate-pulse rounded mb-2' />
            <div className='h-6 w-96 bg-slate-700 animate-pulse rounded' />
          </div>

          <div className='grid lg:grid-cols-4 gap-8'>
            {/* Filters Sidebar skeleton */}
            <div className='lg:col-span-1'>
              <Card className='bg-slate-800 border-slate-700 p-6'>
                <div className='space-y-6'>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className='space-y-2'>
                      <div className='h-4 bg-slate-700 animate-pulse rounded w-1/3' />
                      <div className='h-10 bg-slate-700 animate-pulse rounded' />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Players Grid skeleton */}
            <div className='lg:col-span-3'>
              {/* Controls skeleton */}
              <div className='mb-6 space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='h-6 w-32 bg-slate-700 animate-pulse rounded' />
                  <div className='h-10 w-48 bg-slate-700 animate-pulse rounded' />
                </div>
              </div>

              {/* Grid skeleton */}
              <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-6'>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className='bg-slate-800/50 border-slate-700'>
                    <div className='p-6 space-y-4'>
                      <div className='space-y-2'>
                        <div className='h-6 bg-slate-700 animate-pulse rounded w-3/4' />
                        <div className='h-4 bg-slate-700 animate-pulse rounded w-1/2' />
                      </div>

                      <div className='space-y-2'>
                        {[1, 2, 3, 4].map((j) => (
                          <div
                            key={j}
                            className='h-4 bg-slate-700 animate-pulse rounded'
                          />
                        ))}
                      </div>

                      <div className='space-y-2'>
                        <div className='h-4 bg-slate-700 animate-pulse rounded w-full' />
                        <div className='h-4 bg-slate-700 animate-pulse rounded w-5/6' />
                      </div>

                      <div className='pt-4 flex gap-2'>
                        <div className='flex-1 h-10 bg-slate-700 animate-pulse rounded' />
                        <div className='h-10 w-10 bg-slate-700 animate-pulse rounded' />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
