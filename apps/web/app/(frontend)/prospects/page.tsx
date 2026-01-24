import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { findOne } from '@/lib/payload-helpers'
import { ProspectsList } from './ProspectsList'
import { PageLoadingState } from '@/components/PageLoadingState'
import { H1 } from '@/components/ui/typography/H1'
import { MutedText } from '@/components/ui/typography/MutedText'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Plus, Upload } from 'lucide-react'

interface ProspectsPageProps {
  searchParams: Promise<{
    sortBy?: string
    page?: string
    view?: 'grid' | 'table'
  }>
}

export default async function ProspectsPage({ searchParams }: ProspectsPageProps) {
  const params = await searchParams
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect('/sign-in')
  }

  // Verify user is a coach
  const user = await findOne('users', { clerkId: { equals: clerkUser.id } })

  if (!user || !user.roles?.includes('coach')) {
    redirect('/')
  }

  // Find the coach profile
  const coachProfile = await findOne('coaches', { user: { equals: user.id } })

  if (!coachProfile) {
    redirect('/')
  }

  return (
    <div className='px-4 sm:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8 flex flex-col gap-4 sm:gap-5'>
          <div className='text-center'>
            <H1 className='mb-2 sm:mb-6'>My Prospects</H1>
            <MutedText>
              Track players who haven&apos;t registered on the platform yet
            </MutedText>
          </div>
          <div className='flex gap-3 justify-center'>
            <ButtonLink href='/prospects/create' variant='default' size='sm'>
              <Plus className='w-4 h-4 mr-2' />
              Add Prospect
            </ButtonLink>
            <ButtonLink href='/prospects/create?tab=import' variant='outline' size='sm'>
              <Upload className='w-4 h-4 mr-2' />
              Import CSV
            </ButtonLink>
          </div>
        </div>

        {/* Content */}
        <Suspense fallback={<PageLoadingState message='Loading prospects...' />}>
          <ProspectsList coachId={coachProfile.id} searchParams={params} />
        </Suspense>
      </div>
    </div>
  )
}
