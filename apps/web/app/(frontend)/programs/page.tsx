import { Suspense } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { ProgramFilters } from '@/components/ProgramFilters'
import { PublicNav } from '@/components/PublicNav'
import { UnauthenticatedCTA } from '@/components/UnauthenticatedCTA'
import { ProgramsList } from './ProgramsList'
import { ProgramCardsSkeleton } from '@/components/ui/skeletons/ProgramCardSkeleton'

interface ProgramsPageProps {
  searchParams: Promise<{
    division?: string
    state?: string
    type?: string
    hasCoach?: string
    search?: string
    page?: string
    sortBy?: string
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
      <div className='min-h-screen bg-slate-50 dark:bg-slate-900'>
        <div className={isLoggedOut ? 'py-12 px-4' : 'p-8'}>
          <div className='max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-8'>
              <h1 className='text-4xl font-bold mb-2 text-slate-900 dark:text-white'>
                College Programs
              </h1>
              <p className='text-slate-600 dark:text-slate-400'>
                Browse women&apos;s college basketball programs and connect with coaches
              </p>
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
            <Suspense fallback={<ProgramCardsSkeleton count={24} />}>
              <ProgramsList searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}
