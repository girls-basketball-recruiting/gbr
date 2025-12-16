import { getPayload } from 'payload'
import config from '@/payload.config'
import { ProgramFilters } from '@/components/ProgramFilters'
import { ProgramCard } from '@/components/ui/ProgramCard'
import { Pagination } from '@/components/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { ActiveFilterChips } from '@/components/ActiveFilterChips'
import { PublicNav } from '@/components/PublicNav'
import { UnauthenticatedCTA } from '@/components/UnauthenticatedCTA'
import { currentUser } from '@clerk/nextjs/server'

interface ProgramsPageProps {
  searchParams: Promise<{
    division?: string
    state?: string
    type?: string
    hasCoach?: string
    search?: string
    page?: string
  }>
}

export default async function ProgramsPage({ searchParams }: ProgramsPageProps) {
  const params = await searchParams

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Check authentication status
  const clerkUser = await currentUser()

  // Build where clause
  const where: any = {}

  if (params.division) {
    where.division = { equals: params.division }
  }

  if (params.state) {
    where.state = { equals: params.state }
  }

  if (params.type) {
    where.type = { equals: params.type }
  }

  if (params.search) {
    where.school = { contains: params.search, options: 'i' }
  }

  // Pagination
  const page = parseInt(params.page || '1')
  const limit = 24

  // Fetch colleges
  const collegesData = await payload.find({
    collection: 'colleges',
    where: Object.keys(where).length > 0 ? where : undefined,
    limit,
    page,
    sort: 'school',
  })

  let programs = collegesData.docs
  let totalPages = collegesData.totalPages
  let totalDocs = collegesData.totalDocs

  // Fetch all coaches to determine which programs have coaches
  const coaches = await payload.find({
    collection: 'coaches',
    limit: 10000,
  })

  const collegeIdsWithCoaches = new Set(
    coaches.docs.map((coach: any) => coach.collegeId)
  )

  // Filter if hasCoach is set
  if (params.hasCoach === 'true') {
    programs = programs.filter((college: any) =>
      collegeIdsWithCoaches.has(college.id)
    )
    totalDocs = programs.length
    totalPages = Math.ceil(totalDocs / limit)
  }

  // Add hasCoach flag to each program
  const programsWithCoachStatus = programs.map((college: any) => ({
    ...college,
    hasCoach: collegeIdsWithCoaches.has(college.id),
  }))

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
                Browse women's college basketball programs and connect with coaches
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
            <div className='mb-6'>
              <ProgramFilters />
            </div>

            {/* Active Filters */}
            <ActiveFilterChips />

            {/* Results count */}
            <div className='mb-6 flex items-center justify-between'>
              <p className='text-slate-600 dark:text-slate-400'>
                {totalDocs.toLocaleString()} college women&apos;s basketball {totalDocs === 1 ? 'program' : 'programs'}
              </p>
            </div>

            {/* Programs Grid */}
            {programsWithCoachStatus.length === 0 ? (
              <EmptyState
                title='No Programs Found'
                description='Try adjusting your filters to see more results.'
              />
            ) : (
              <>
                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
                  {programsWithCoachStatus.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination currentPage={page} totalPages={totalPages} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
