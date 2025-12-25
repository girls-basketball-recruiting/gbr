import { Suspense } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { PublicNav } from '@/components/PublicNav'
import { UnauthenticatedCTA } from '@/components/UnauthenticatedCTA'
import { TournamentsList } from './TournamentsList'
import { TournamentCardsSkeleton } from '@/components/ui/skeletons/TournamentCardSkeleton'

interface TournamentsPageProps {
  searchParams: Promise<{
    filter?: 'all' | 'upcoming' | 'past'
  }>
}

export default async function TournamentsPage({
  searchParams,
}: TournamentsPageProps) {
  const params = await searchParams
  const clerkUser = await currentUser()
  const isLoggedOut = !clerkUser
  const isPlayer = clerkUser?.publicMetadata?.role === 'player'

  return (
    <>
      {isLoggedOut && <PublicNav activePage='tournaments' />}
      <div className='min-h-screen bg-slate-50 dark:bg-slate-900'>
        <div className={isLoggedOut ? 'py-12 px-4' : 'p-8'}>
          <div className='max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-8'>
              <h1 className='text-4xl font-bold mb-2 text-slate-900 dark:text-white'>
                AAU Tournaments
              </h1>
              <p className='text-slate-600 dark:text-slate-400'>
                {isPlayer
                  ? "View upcoming tournaments and mark which ones you'll be attending"
                  : 'View upcoming tournaments and see which players are attending'}
              </p>
            </div>

            {/* Unauthenticated CTA */}
            {isLoggedOut && (
              <div className='mb-8'>
                <UnauthenticatedCTA
                  title='Join to Track Your Schedule'
                  description="Sign up as a player to mark tournaments you're attending and get discovered by college coaches. Coaches can see which events have the most talent."
                  variant='premium'
                />
              </div>
            )}

            {/* Content */}
            <Suspense fallback={<TournamentCardsSkeleton count={6} />}>
              <TournamentsList searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}
