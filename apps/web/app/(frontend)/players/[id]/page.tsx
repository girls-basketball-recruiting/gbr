import { notFound } from 'next/navigation'
import { Card } from '@workspace/ui/components/card'
import Image from 'next/image'
import { currentUser } from '@clerk/nextjs/server'
import { CoachNotesSection } from '@/components/CoachNotesSection'
import { SavePlayerButton } from '@/components/SavePlayerButton'
import { ProfileView } from '@/components/profile/ProfileView'
import type { Metadata } from 'next'
import { getPositionLabel } from '@/lib/zod/Positions'
import { formatHeight } from '@/lib/formatters'
import { findById, findOne, exists } from '@/lib/payload-helpers'
import { Tournament } from '@/payload-types'
import { ButtonLink } from '@/components/ui/ButtonLink'

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  try {
    const player = await findById('players', id)

    if (!player) {
      return {
        title: 'Player Not Found',
      }
    }

    const fullName = `${player.firstName} ${player.lastName}`
    const position = player.primaryPosition
      ? getPositionLabel(player.primaryPosition)
      : ''
    const school = player.highSchool || ''
    const graduationYear = player.graduationYear

    const title = `${fullName} - ${position} | Class of ${graduationYear}`
    const description = `${fullName} is a ${position} at ${school}, graduating in ${graduationYear}. View profile and connect with this talented basketball recruit.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'profile',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    }
  } catch {
    return {
      title: 'Player Profile',
    }
  }
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clerkUser = await currentUser()

  // Fetch the player
  const player = await findById('players', id)

  if (!player) {
    notFound()
  }

  // Get tournament schedule from player object (populated by Payload)
  // Ensure it's treated as an array of Tournaments, filtering out any unresolved IDs if mixed
  const tournamentSchedule = (player.tournamentSchedule as unknown as Tournament[])?.filter(t => typeof t === 'object') || []

  // Check if user is authenticated
  const isAuthenticated = !!clerkUser

  // Check if current user is a coach
  let isCoach = false
  let coachProfile = null
  let isSaved = false

  if (clerkUser) {
    const user = await findOne('users', { clerkId: { equals: clerkUser.id } })

    if (user) {
      isCoach = user.roles?.includes('coach') || false

      if (isCoach) {
        // Find the coach profile
        // Note: user field in coaches collection is a relationship to users collection
        coachProfile = await findOne('coaches', { user: { equals: user.id } })

        // Check if this player is saved
        if (coachProfile) {
          isSaved = await exists('coach-saved-players', {
            coach: { equals: coachProfile.id },
            player: { equals: parseInt(id) }
          })
        }
      }
    }
  }

  // If not authenticated, show limited public view for SEO
  if (!isAuthenticated) {
    return (
      <div className='min-h-svh py-12'>
        <div className='container mx-auto px-4 max-w-3xl'>

          {/* Public Player Profile */}
          <Card className='p-8 mb-8'>
            <div className='text-center space-y-6'>
              {/* Profile Image */}
              {player.profileImageUrl && (
                <div className='flex justify-center'>
                  <div className='w-32 h-32 rounded-full overflow-hidden relative'>
                    <Image
                      src={player.profileImageUrl}
                      alt={`${player.firstName} ${player.lastName}`}
                      fill
                      className='object-cover'
                    />
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <h1 className='text-4xl font-bold mb-2'>
                  {player.firstName} {player.lastName}
                </h1>
                <p className='text-xl'>
                  Class of {player.graduationYear}
                </p>
              </div>

              {/* Limited Info */}
              <div className='space-y-3 max-w-md mx-auto'>
                {player.primaryPosition && (
                  <div className='flex items-center justify-center gap-2'>
                    <span>Position:</span>
                    <span className='font-medium'>
                      {getPositionLabel(player.primaryPosition)}
                    </span>
                  </div>
                )}
                {player.highSchool && (
                  <div className='flex items-center justify-center gap-2'>
                    <span>School:</span>
                    <span className='font-medium'>{player.highSchool}</span>
                  </div>
                )}
                {player.heightInInches && (
                  <div className='flex items-center justify-center gap-2'>
                    <span>Height:</span>
                    <span className='font-medium'>{formatHeight(player.heightInInches)}</span>
                  </div>
                )}
                {player.weight && (
                  <div className='flex items-center justify-center gap-2'>
                    <span>Weight:</span>
                    <span className='font-medium'>{player.weight} lbs</span>
                  </div>
                )}
              </div>

              {/* CTA to Sign Up */}
              <div className='pt-6 border-t'>
                <p className='mb-4'>
                  Sign in or register to view full profile including stats, highlight videos, and
                  contact information
                </p>
                <div className='text-center space-x-3'>
                  <ButtonLink href='/sign-in' variant='outline'>
                    Sign In
                  </ButtonLink>
                  <ButtonLink href='/register-player'>
                    Register as Player
                  </ButtonLink>
                  <ButtonLink href='/register-coach' variant='secondary'>
                    Register as Coach
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className='p-8'>
      <div className='max-w-5xl mx-auto space-y-8'>
        {/* Save Player Button for Coaches - Fixed at top */}
        {isCoach && (
          <div className='flex justify-end'>
            <SavePlayerButton
              playerId={player.id}
              initialIsSaved={isSaved}
              variant='outline'
              size='lg'
            />
          </div>
        )}

        {/* Player Profile View */}
        <ProfileView profile={player} variant='player' tournamentSchedule={tournamentSchedule} />

        {/* Coach Notes Section - Only visible to coaches */}
        {isCoach && coachProfile && (
          <CoachNotesSection playerId={id} coachId={String(coachProfile.id)} />
        )}
      </div>
    </div>
  )
}
