import { Suspense } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { PublicNav } from '@/components/PublicNav'
import { UnauthenticatedCTA } from '@/components/UnauthenticatedCTA'
import { TournamentFilters } from '@/components/TournamentFilters'
import { TournamentsList } from './TournamentsList'
import { PageLoadingState } from '@/components/PageLoadingState'
import { H1, MutedText } from '@/components/ui/typography'

interface TournamentsPageProps {
  searchParams: Promise<{
    states?: string
    startDate?: string
    endDate?: string
    hasPlayers?: string
    hasCoaches?: string
    includePast?: string
    sortBy?: string
    page?: string
    view?: 'grid' | 'table'
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
      <div>
        <div className={isLoggedOut ? 'py-12 px-4' : 'px-4 sm:px-8'}>
          <div className='max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-6 sm:mb-8 text-center'>
              <H1 className='mb-2 sm:mb-6'>AAU Tournaments</H1>
              <MutedText className='text-base sm:text-xl'>
                {isPlayer
                  ? "View upcoming tournaments and mark which ones you'll be attending"
                  : 'View upcoming tournaments and see how many players are attending'}
              </MutedText>
            </div>

            {/* Unauthenticated CTA */}
            {isLoggedOut && (
              <div className='mb-8'>
                <UnauthenticatedCTA
                  title='Join to Track Your Schedule'
                  description="Sign up as a player to mark tournaments you're attending and get discovered by college programs. Coaches can see which events have the most players attending."
                  variant='premium'
                />
              </div>
            )}

            {/* Filters */}
            <TournamentFilters />

            {/* Content */}
            <Suspense fallback={<PageLoadingState message='Loading tournaments...' />}>
              <TournamentsList searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}
