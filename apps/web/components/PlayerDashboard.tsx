import Link from 'next/link'
import Image from 'next/image'
import { TournamentScheduleSection } from './dashboard/TournamentScheduleSection'
import { SavedProgramsSection } from './dashboard/SavedProgramsSection'
import { Suspense } from 'react'
import { getAuthContext } from '@/lib/auth-context'
import { hasActiveSubscription } from '@/lib/stripe'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { ButtonLink } from './ui/ButtonLink'

export default async function PlayerDashboard() {
  const { playerProfile, dbUser } = await getAuthContext()

  // Check subscription status
  let isSubscribed = false
  let currentPeriodEnd: string | null = null
  if (dbUser.stripeCustomerId) {
    isSubscribed = await hasActiveSubscription(dbUser.stripeCustomerId)
    currentPeriodEnd = dbUser.stripeCurrentPeriodEnd || null
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-6xl mx-auto'>
        {playerProfile && (
          <div className='mb-8 border rounded-lg p-6'>
            <div className='flex items-center gap-6'>
              {playerProfile.profileImageUrl ? (
                <div className='w-24 h-24 rounded-full overflow-hidden relative shrink-0'>
                  <Image
                    src={playerProfile.profileImageUrl}
                    alt={`${playerProfile.firstName} ${playerProfile.lastName} profile image`}
                    fill
                    className='object-cover'
                  />
                </div>
              ) : (
                <div className='w-24 h-24 rounded-full flex items-center justify-center shrink-0'>
                  <span className='text-3xl font-bold'>
                    {playerProfile.firstName?.[0]}
                    {playerProfile.lastName?.[0]}
                  </span>
                </div>
              )}
              <div className='flex-1'>
                <h2 className='text-2xl font-bold mb-1'>
                  {playerProfile.firstName} {playerProfile.lastName}
                </h2>
                <div className='flex items-center gap-2 mt-2'>
                  {isSubscribed ? (
                    <>
                      <CheckCircle2 className='w-4 h-4' />
                      <span className='text-sm font-medium'>
                        Player Pro
                      </span>
                      {currentPeriodEnd && (
                        <span className='text-sm'>
                          • Renews {new Date(currentPeriodEnd).toLocaleDateString()}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <AlertCircle className='w-4 h-4' />
                      <span className='text-sm'>
                        Free Plan
                      </span>
                      <Link
                        href='/subscription'
                        className='text-sm hover:underline ml-1'
                      >
                        Upgrade to Pro
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div className='flex-col gap-2'>
                <ButtonLink href='/profile' variant='ghost' className='block mb-4'>
                  View Profile
                </ButtonLink>
                <ButtonLink href='/profile/edit' variant='outline'>
                  Edit Profile
                </ButtonLink>
              </div>
            </div>
          </div>
        )}

        {/* Saved Programs Section */}
        {playerProfile && (
          <div className='mb-8'>
            <h3 className='text-2xl font-bold mb-4'>
              Saved Programs
            </h3>

            <Suspense>
              <SavedProgramsSection playerId={playerProfile.id} />
            </Suspense>
          </div>
        )}

        {/* Tournament Schedule Section */}
        {playerProfile && (
          <div className='mb-8'>
            <h3 className='text-2xl font-bold mb-4'>
              Tournament Schedule
            </h3>

            <Suspense>
              <TournamentScheduleSection playerId={playerProfile.id} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
}
