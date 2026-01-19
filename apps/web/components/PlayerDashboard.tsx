import Image from 'next/image'
import { TournamentScheduleSection } from './dashboard/TournamentScheduleSection'
import { SavedProgramsSection } from './dashboard/SavedProgramsSection'
import { Suspense } from 'react'
import { getAuthContext } from '@/lib/auth-context'
import { ButtonLink } from './ui/ButtonLink'
import { H2, H3 } from './ui/typography'

export default async function PlayerDashboard() {
  const { playerProfile } = await getAuthContext()

  return (
    <div className='container mx-auto px-5'>
      <div className='max-w-6xl mx-auto'>
        {playerProfile && (
          <div className='mb-8'>
            <div className='flex items-center gap-6'>
              {playerProfile.profileImageUrl && (
                <div className='w-24 h-24 rounded-xl overflow-hidden relative shrink-0'>
                  <Image
                    src={playerProfile.profileImageUrl}
                    alt={`${playerProfile.firstName} ${playerProfile.lastName} profile image`}
                    fill
                    className='object-cover'
                  />
                </div>
              )}
              <div className='flex-1'>
                <div className='flex items-center gap-6'>
                  <H2>{playerProfile.firstName} {playerProfile.lastName}</H2>
                </div>
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
        )}

        {/* Saved Programs Section */}
        {playerProfile && (
          <div className='mt-16'>
            <H3 className='mb-4'>
              Saved Programs
            </H3>

            <Suspense>
              <SavedProgramsSection playerId={playerProfile.id} />
            </Suspense>
          </div>
        )}

        {/* Tournament Schedule Section */}
        {playerProfile && (
          <div className='mt-16'>
            <div className='flex justify-between w-full'>
              <H3 className='mb-4'>
                Tournament Schedule
              </H3>
              <ButtonLink href="/tournaments" variant="outline" size='sm'>
                View All Tournaments
              </ButtonLink>
            </div>

            <Suspense>
              <TournamentScheduleSection playerId={playerProfile.id} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
}
