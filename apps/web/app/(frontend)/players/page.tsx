import { Suspense } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { PlayerFilters } from '@/components/PlayerFilters'
import { PublicNav } from '@/components/PublicNav'
import { UnauthenticatedCTA } from '@/components/UnauthenticatedCTA'
import { PlayersList } from './PlayersList'
import { PlayerCardsSkeleton } from '@/components/ui/skeletons/PlayerCardSkeleton'

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
      <div className='min-h-screen bg-slate-50 dark:bg-slate-900'>
        <div className={isLoggedOut ? 'py-12 px-4' : 'p-8'}>
          <div className='max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-8'>
              <h1 className='text-4xl font-bold mb-2 text-slate-900 dark:text-white'>
                Browse Players
              </h1>
              <p className='text-slate-600 dark:text-slate-400'>
                Find talented recruits and save them to your board
              </p>
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
            <Suspense fallback={<PlayerCardsSkeleton count={24} />}>
              <PlayersList searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}
