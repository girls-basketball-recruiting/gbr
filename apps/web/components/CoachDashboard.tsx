import { Suspense } from 'react'
import Image from 'next/image'
import { getCoachPositionLabel } from '@/lib/zod/CoachPositions'
import { RecruitingBoardSection } from './dashboard/RecruitingBoardSection'
import { ProspectsActions } from './dashboard/ProspectsActions'
import { TournamentScheduleSection } from './dashboard/TournamentScheduleSection'
import { getAuthContext } from '@/lib/auth-context'
import { redirect } from 'next/navigation'
import { ButtonLink } from './ui/ButtonLink'
import Link from 'next/link'

export default async function CoachDashboard() {
  // Fetch saved players for this coach
  const { coachProfile } = await getAuthContext()

  if (!coachProfile) {
    redirect('/onboarding/coach')
  }

  return (
    <div className='container mx-auto px-5'>
      <div className='max-w-4xl mx-auto'>
        {/* Coach Profile Header */}
        <div className='mb-8'>
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
                <Link href={`/programs/${coachProfile.collegeId}`} className='text-primary hover:underline'>
                  {coachProfile.collegeName}
                </Link>
              </p>
            </div>
            <div>
              <ButtonLink href='/profile' variant='ghost' className='mr-2' size='sm'>
                View Profile
              </ButtonLink>
              <ButtonLink href='/profile/edit' variant='outline' size='sm'>
                Edit Profile
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Recruiting Board Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-2xl font-bold'>
              Recruiting Board
            </h3>
            <ProspectsActions />
          </div>

          <Suspense fallback={<RecruitingBoardSkeleton />}>
            <RecruitingBoardSection coachId={coachProfile.id} />
          </Suspense>
        </div>

        {/* Tournament Schedule Section */}
        <div className='mt-16 mb-4'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-2xl font-bold'>
              Tournament Schedule
            </h3>
            <ButtonLink href="/tournaments" variant="outline" size='sm'>
              View All Tournaments
            </ButtonLink>
          </div>

          <Suspense>
            <TournamentScheduleSection coachId={coachProfile.id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function RecruitingBoardSkeleton() {
  return (
    <div className='rounded-lg border bg-card divide-y animate-pulse'>
      {[...Array(5)].map((_, i) => (
        <div key={i} className='flex items-center gap-4 px-4 py-3'>
          <div className='w-8 shrink-0' />
          <div className='w-14 h-14 rounded-lg bg-muted shrink-0' />
          <div className='flex-1 space-y-2'>
            <div className='h-4 bg-muted rounded w-1/3' />
            <div className='h-3 bg-muted rounded w-1/2' />
          </div>
        </div>
      ))}
    </div>
  )
}
