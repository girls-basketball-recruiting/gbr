import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { getCoachPositionLabel } from '@/lib/zod/CoachPositions'
import { findAll } from '@/lib/payload-helpers'

export async function CoachesSection() {
  const coaches = await findAll('coaches', {}, {
    sort: '-createdAt',
    limit: 12
  })

  return (
    <>
      {coaches.length === 0 ? (
        <EmptyState
          title='No Coaches Yet'
          description='No coaches have created profiles yet. Check back soon to explore college programs!'
        />
      ) : (
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {coaches.map((coach) => (
            <Card
              key={coach.id}
              className='min-w-72 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors'
            >
              <div className='p-6 space-y-4'>
                <div>
                  <h4 className='text-xl font-semibold text-slate-900 dark:text-white'>
                    {coach.firstName} {coach.lastName}
                  </h4>
                  <p className='text-slate-600 dark:text-slate-400 text-sm'>
                    {coach.collegeName}
                  </p>
                </div>

                <div className='space-y-2 text-sm'>
                  {coach.jobTitle && (
                    <div className='flex items-center gap-2'>
                      <span className='text-slate-600 dark:text-slate-400'>Position:</span>
                      <span className='text-slate-900 dark:text-white'>
                        {getCoachPositionLabel(coach.jobTitle)}
                      </span>
                    </div>
                  )}
                </div>

                {coach.bio && (
                  <p className='text-slate-700 dark:text-slate-300 text-sm line-clamp-3'>
                    {coach.bio}
                  </p>
                )}

                <div className='pt-4 flex gap-2'>
                  <Button className='flex-1 bg-blue-600 hover:bg-blue-700' asChild>
                    <Link href={`/coaches/${coach.id}`}>View Profile</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
