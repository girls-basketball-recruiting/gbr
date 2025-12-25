import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

import { StatCard } from './ui/StatCard'
import Image from 'next/image'
import { getPositionLabel } from '@/lib/zod/Positions'
import { CoachesSection } from './dashboard/CoachesSection'
import { CoachCardsSkeleton } from './ui/skeletons/CoachCardSkeleton'
import { Suspense } from 'react'
import { getAuthContext } from '@/lib/auth-context'

export default async function PlayerDashboard() {
  const { playerProfile } = await getAuthContext()

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-6xl mx-auto'>
        {playerProfile && (
          <div className='mb-8 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6'>
            <div className='flex items-center gap-6'>
              {playerProfile.profileImageUrl ? (
                <div className='w-24 h-24 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 relative shrink-0'>
                  <Image
                    src={playerProfile.profileImageUrl}
                    alt={`${playerProfile.firstName} ${playerProfile.lastName} profile image`}
                    fill
                    className='object-cover'
                  />
                </div>
              ) : (
                <div className='w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0'>
                  <span className='text-3xl font-bold text-slate-900 dark:text-white'>
                    {playerProfile.firstName?.[0]}
                    {playerProfile.lastName?.[0]}
                  </span>
                </div>
              )}
              <div className='flex-1'>
                <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-1'>
                  {playerProfile.firstName} {playerProfile.lastName}
                </h2>
                <p className='text-slate-600 dark:text-slate-400'>
                  {playerProfile.primaryPosition &&
                    getPositionLabel(playerProfile.primaryPosition)}
                  {playerProfile.secondaryPosition &&
                    ` / ${getPositionLabel(playerProfile.secondaryPosition)}`}
                  {' • '}
                  Class of {playerProfile.graduationYear}
                </p>
                <p className='text-slate-600 dark:text-slate-400 text-sm mt-1'>
                  {playerProfile.highSchool}
                  {playerProfile.city && ` • ${playerProfile.city}`}
                  {playerProfile.state && `, ${playerProfile.state}`}
                </p>
              </div>
              <div className='flex gap-2'>
                <Button asChild variant='outline'>
                  <Link href='/profile'>View Profile</Link>
                </Button>
                <Button asChild variant='outline'>
                  <Link href='/profile/edit'>Edit Profile</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className='mb-8'>
          <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
            College Programs
          </h3>

          <Suspense fallback={<CoachCardsSkeleton count={12} />}>
            <CoachesSection />
          </Suspense>
        </div>

        <div className='grid md:grid-cols-3 gap-6 mb-8'>
          <StatCard label='Profile Views' value={0} />
          <StatCard label='Available Coaches' value={0} />
          <StatCard label='This Month' value={0} />
        </div>
      </div>
    </div>
  )
}
