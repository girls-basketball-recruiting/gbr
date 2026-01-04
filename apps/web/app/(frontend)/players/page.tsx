import { Suspense } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { PlayerFilters } from '@/components/PlayerFilters'
import { PublicNav } from '@/components/PublicNav'
import { UnauthenticatedCTA } from '@/components/UnauthenticatedCTA'
import { PlayersList } from './PlayersList'
import { PageLoadingState } from '@/components/PageLoadingState'
import { H1 } from '@/components/ui/typography/H1'
import { MutedText } from '@/components/ui/typography/MutedText'

interface PlayersPageProps {
  searchParams: Promise<{
    graduationYear?: string
    position?: string
    minGpa?: string
    maxGpa?: string
    minHeight?: string
    maxHeight?: string
    state?: string
    city?: string
    sortBy?: string
    page?: string
    view?: 'grid' | 'table'
  }>
}

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const params = await searchParams
  const clerkUser = await currentUser()
  const isLoggedOut = !clerkUser

  return (
    <>
      {isLoggedOut && <PublicNav activePage='players' />}
      <div>
        <div className={isLoggedOut ? 'py-12 px-4' : 'px-8'}>
          <div className='max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-8'>
              <H1 className='mb-6'>Browse Players</H1>
              <MutedText className='text-center text-xl'>
                Find talented recruits and save them to your board
              </MutedText>
            </div>

            {/* Unauthenticated CTA */}
            {isLoggedOut && (
              <div className='mb-8'>
                <UnauthenticatedCTA
                  title='Create an Account to Connect'
                  description='Sign up as a coach to save players, take notes, and build your recruiting board. Sign up as a player to create your profile and get discovered.'
                  variant='premium'
                />
              </div>
            )}

            {/* Filters */}
            <PlayerFilters />

            {/* Content */}
            <Suspense fallback={<PageLoadingState message='Loading players...' />}>
              <PlayersList searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}
