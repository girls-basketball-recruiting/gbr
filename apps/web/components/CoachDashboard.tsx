import { Suspense } from 'react'
import Image from 'next/image'
import { getCoachPositionLabel } from '@/lib/zod/CoachPositions'
import { SavedPlayersSection } from './dashboard/SavedPlayersSection'
import { ProspectsSection } from './dashboard/ProspectsSection'
import { getAuthContext } from '@/lib/auth-context'
import { redirect } from 'next/navigation'
import { ButtonLink } from './ui/ButtonLink'

export default async function CoachDashboard() {
  // Fetch saved players for this coach
  const { coachProfile } = await getAuthContext()

  if (!coachProfile) {
    redirect('/onboarding/coach')
  }

  return (
    <div className='container mx-auto px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Coach Profile Header */}
        <div className='mb-8 rounded-lg'>
          <div className='flex items-center gap-6'>
            {coachProfile.profileImageUrl && (
              <div className='w-24 h-24 rounded-full overflow-hidden relative shrink-0'>
                <Image
                  src={coachProfile.profileImageUrl}
                  alt={coachProfile.firstName + ' ' + coachProfile.lastName}
                  fill
                  className='object-cover'
                />
              </div>
            )}
            <div className='flex-1'>
              <h2 className='text-2xl font-bold mb-1'>
                {coachProfile.firstName} {coachProfile.lastName}
              </h2>
              <p>
                {coachProfile.jobTitle && `${getCoachPositionLabel(coachProfile.jobTitle)} @ `}
                {coachProfile.collegeName}
              </p>
            </div>
            <div>
              <ButtonLink href='/profile' variant='ghost' className='mr-2'>
                View Profile
              </ButtonLink>
              <ButtonLink href='/profile/edit' variant='outline'>
                Edit Profile
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Saved Players Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-2xl font-bold'>
              Saved Players
              <span className='ml-2 text-sm font-normal'>
                (Registered Users)
              </span>
            </h3>
          </div>

          <Suspense>
            <SavedPlayersSection coachId={coachProfile.id} />
          </Suspense>
        </div>

        {/* My Prospects Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-2xl font-bold'>
              My Prospects
              <span className='ml-2 text-sm font-normal'>
                (Manual Entries)
              </span>
            </h3>
            <ButtonLink href='/prospects/create' variant='ghost'>
              + Add Prospect
            </ButtonLink>
          </div>

          <Suspense>
            <ProspectsSection coachId={coachProfile.id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
