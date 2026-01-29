import { Suspense } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { ProgramFilters } from '@/components/ProgramFilters'
import { PublicNav } from '@/components/PublicNav'
import { UnauthenticatedCTA } from '@/components/UnauthenticatedCTA'
import { ProgramsList } from './ProgramsList'
import { PageLoadingState } from '@/components/PageLoadingState'
import { H1 } from '@/components/ui/typography/H1'
import { MutedText } from '@/components/ui/typography/MutedText'

interface ProgramsPageProps {
  searchParams: Promise<{
    divisions?: string
    states?: string
    conferences?: string
    type?: string
    search?: string
    page?: string
    sortBy?: string
    pageSize?: string
    view?: 'grid' | 'table'
  }>
}

export default async function ProgramsPage({ searchParams }: ProgramsPageProps) {
  const params = await searchParams
  const clerkUser = await currentUser()
  const isLoggedOut = !clerkUser

  return (
    <>
      {isLoggedOut && <PublicNav activePage='programs' />}
      <div>
        <div className={isLoggedOut ? 'py-12 px-4' : 'px-4 sm:px-8'}>
          <div className='max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-6 sm:mb-8 text-center'>
              <H1 className='mb-2 sm:mb-6'>College Programs</H1>
              <MutedText className='text-base sm:text-xl'>
                Discover and connect with women&apos;s college basketball programs
              </MutedText>
            </div>

            {/* Unauthenticated CTA */}
            {isLoggedOut && (
              <div className='mb-8'>
                <UnauthenticatedCTA
                  title='Unlock Full Program Details'
                  description='Create an account to see coaching staff contacts, save programs to your list, and get personalized recommendations based on your profile.'
                  variant='premium'
                />
              </div>
            )}

            {/* Filters */}
            <ProgramFilters />

            {/* Content */}
            <Suspense fallback={<PageLoadingState message='Loading college programs...' />}>
              <ProgramsList searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}
