import { notFound } from 'next/navigation'
import { Card } from '@workspace/ui/components/card'
import Image from 'next/image'
import { currentUser } from '@clerk/nextjs/server'
import {
  MapPin,
  Ruler,
  Weight,
  School,
  User,
} from 'lucide-react'
import { SavePlayerButton } from '@/components/SavePlayerButton'
import { ProfileView } from '@/components/profile/ProfileView'
import { PublicNav } from '@/components/PublicNav'
import { UnauthenticatedCTA } from '@/components/UnauthenticatedCTA'
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
  // Ensure it's treated as an array of Tournaments, filtering out any unresolved IDs or nulls
  // Note: typeof null === 'object' in JS, so we must also check truthiness
  const tournamentSchedule = (player.tournamentSchedule as unknown as Tournament[])?.filter(t => t && typeof t === 'object') || []

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
      <>
        <PublicNav activePage='players' />
        <div className='py-12 px-4'>
          <div className='max-w-lg mx-auto'>
            {/* Unauthenticated CTA */}
            <div className='mb-8'>
              <UnauthenticatedCTA
                title='Connect with Student-Athletes'
                description='Create an account to view academic profiles, player profiles, highlight videos, and contact information. Coaches can save players and take notes.'
                variant='premium'
              />
            </div>

            {/* Player Header */}
            <Card className='max-w-lg p-8 mb-8'>
              <div className='flex items-start gap-6 mb-6'>
                {/* Profile Image */}
                {player.profileImageUrl ? (
                  <div className='w-24 h-24 rounded-full overflow-hidden relative shrink-0'>
                    <Image
                      src={player.profileImageUrl}
                      alt={`${player.firstName} ${player.lastName}`}
                      fill
                      className='object-cover'
                    />
                  </div>
                ) : (
                  <div className='w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center shrink-0'>
                    <User className='w-10 h-10 text-orange-500' />
                  </div>
                )}

                {/* Name & Class */}
                <div className='flex-1'>
                  <h1 className='text-3xl font-bold mb-1'>
                    {player.firstName} {player.lastName}
                  </h1>
                  <p className='text-lg text-muted-foreground'>
                    Class of {player.graduationYear}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-6'>
                {/* Position */}
                {player.primaryPosition && (
                  <div className='flex items-start gap-3'>
                    <div className='w-6 min-w-6'>
                      <User className='w-5 h-5' />
                    </div>
                    <div>
                      <h3 className='text-sm font-medium text-muted-foreground mb-1'>
                        Position
                      </h3>
                      <p className='font-medium'>
                        {getPositionLabel(player.primaryPosition)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {(player.city || player.state) && (
                  <div className='flex items-start gap-3'>
                    <div className='w-6 min-w-6'>
                      <MapPin className='w-5 h-5' />
                    </div>
                    <div>
                      <h3 className='text-sm font-medium text-muted-foreground mb-1'>
                        Location
                      </h3>
                      <p className='font-medium'>
                        {player.city}{player.city && player.state && ', '}{player.state}
                      </p>
                    </div>
                  </div>
                )}

                {/* Height */}
                {player.heightInInches && (
                  <div className='flex items-start gap-3'>
                    <div className='w-6 min-w-6'>
                      <Ruler className='w-5 h-5' />
                    </div>
                    <div>
                      <h3 className='text-sm font-medium text-muted-foreground mb-1'>
                        Height
                      </h3>
                      <p className='font-medium'>
                        {formatHeight(player.heightInInches)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Weight */}
                {player.weight && (
                  <div className='flex items-start gap-3'>
                    <div className='w-6 min-w-6'>
                      <Weight className='w-5 h-5' />
                    </div>
                    <div>
                      <h3 className='text-sm font-medium text-muted-foreground mb-1'>
                        Weight
                      </h3>
                      <p className='font-medium'>
                        {player.weight} lbs
                      </p>
                    </div>
                  </div>
                )}

                {/* School */}
                {player.highSchool && (
                  <div className='flex items-start gap-3'>
                    <div className='w-6 min-w-6'>
                      <School className='w-5 h-5' />
                    </div>
                    <div>
                      <h3 className='text-sm font-medium text-muted-foreground mb-1'>
                        School
                      </h3>
                      <p className='font-medium'>
                        {player.highSchool}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA to Sign Up */}
              <div className='pt-6 mt-6 border-t'>
                <p className='text-center text-muted-foreground mb-4'>
                  Sign in or register to view full profile including stats, highlight videos, and contact information
                </p>
                <div className='flex flex-wrap justify-center gap-3'>
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
            </Card>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className='p-8'>
      <div className='max-w-6xl mx-auto space-y-8'>
        {/* Player Profile View */}
        <ProfileView
          profile={player}
          variant='player'
          tournamentSchedule={tournamentSchedule}
          coachId={isCoach && coachProfile ? String(coachProfile.id) : undefined}
          headerAction={
            isCoach ? (
              <SavePlayerButton
                playerId={player.id}
                initialIsSaved={isSaved}
                variant='outline'
                size='default'
              />
            ) : undefined
          }
        />
      </div>
    </div>
  )
}
