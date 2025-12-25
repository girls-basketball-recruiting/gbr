import { Suspense } from 'react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { StatCard } from './ui/StatCard'
import Image from 'next/image'
import { getCoachPositionLabel } from '@/lib/zod/CoachPositions'
import { SavedPlayersSection } from './dashboard/SavedPlayersSection'
import { ProspectsSection } from './dashboard/ProspectsSection'
import { PlayerCardsSkeleton } from './ui/skeletons/PlayerCardSkeleton'
import { getAuthContext } from '@/lib/auth-context'
import { redirect } from 'next/navigation'

export default async function CoachDashboard() {
  // Fetch saved players for this coach
  const { coachProfile } = await getAuthContext()

  if (!coachProfile) {
    redirect('/onboarding/coach')
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Coach Profile Header */}
        <div className='mb-8 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6'>
          <div className='flex items-center gap-6'>
            {coachProfile.profileImageUrl ? (
              <div className='w-24 h-24 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 relative shrink-0'>
                <Image
                  src={coachProfile.profileImageUrl}
                  alt={coachProfile.firstName + ' ' + coachProfile.lastName}
                  fill
                  className='object-cover'
                />
              </div>
            ) : (
              <div className='w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0'>
                <span className='text-3xl font-bold text-slate-900 dark:text-white'>
                  {coachProfile.firstName?.[0]}
                </span>
              </div>
            )}
            <div className='flex-1'>
              <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-1'>
                {coachProfile.firstName} {coachProfile.lastName}
              </h2>
              <p className='text-slate-600 dark:text-slate-400'>
                {coachProfile.jobTitle && `${getCoachPositionLabel(coachProfile.jobTitle)} • `}
                {coachProfile.collegeName}
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

        {/* Saved Players Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-2xl font-bold text-slate-900 dark:text-white'>
              Saved Players
              <span className='ml-2 text-sm font-normal text-slate-600 dark:text-slate-400'>
                (Registered Users)
              </span>
            </h3>
          </div>

          <Suspense fallback={<PlayerCardsSkeleton count={6} />}>
            <SavedPlayersSection coachId={coachProfile.id} />
          </Suspense>
        </div>

        {/* My Prospects Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-2xl font-bold text-slate-900 dark:text-white'>
              My Prospects
              <span className='ml-2 text-sm font-normal text-slate-600 dark:text-slate-400'>
                (Manual Entries)
              </span>
            </h3>
            <Link href='/prospects/create'>
              <Button className='bg-purple-600 hover:bg-purple-700'>+ Add Prospect</Button>
            </Link>
          </div>

          <Suspense fallback={<PlayerCardsSkeleton count={6} />}>
            <ProspectsSection coachId={coachProfile.id} />
          </Suspense>
        </div>

        {/* Quick Stats Section */}
        <div className='grid md:grid-cols-3 gap-6 mb-8'>
          <StatCard label='Saved Players' value={0} />
          <StatCard label='My Prospects' value={0} />
          <StatCard label='Total Recruits' value={0} />
        </div>
      </div>
    </div>
  )
}
