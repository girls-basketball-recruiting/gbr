import { Suspense } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { PublicNav } from '@/components/PublicNav'
import { UnauthenticatedCTA } from '@/components/UnauthenticatedCTA'
import { TournamentsList } from './TournamentsList'
import { PageLoadingState } from '@/components/PageLoadingState'
import { H1, MutedText } from '@/components/ui/typography'

interface TournamentsPageProps {
  searchParams: Promise<{
    filter?: 'upcoming' | 'past'
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
        <div className={isLoggedOut ? 'py-12 px-4' : 'px-8'}>
          <div className='max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-8'>
              <H1 className='mb-6'>AAU Tournaments</H1>
              <MutedText className='text-center text-xl'>
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
