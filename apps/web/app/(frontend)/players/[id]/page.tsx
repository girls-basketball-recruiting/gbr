import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { CoachNotesSection } from '@/components/CoachNotesSection'
import { SavePlayerButton } from '@/components/SavePlayerButton'
import type { Metadata } from 'next'

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  try {
    const player = await payload.findByID({
      collection: 'players',
      id,
      depth: 2,
    })

    if (!player) {
      return {
        title: 'Player Not Found',
      }
    }

    const fullName = `${player.firstName} ${player.lastName}`
    const position = player.primaryPosition
      ? player.primaryPosition.replace('-', ' ')
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
  } catch (error) {
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
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const clerkUser = await currentUser()

  // Fetch the player with profile image
  const player = await payload.findByID({
    collection: 'players',
    id,
    depth: 2, // To populate profileImage relation
  })

  if (!player) {
    notFound()
  }

  // Check if user is authenticated
  const isAuthenticated = !!clerkUser

  // Check if current user is a coach
  let isCoach = false
  let coachProfile = null
  let isSaved = false

  if (clerkUser) {
    const users = await payload.find({
      collection: 'users',
      where: {
        clerkId: {
          equals: clerkUser.id,
        },
      },
    })

    if (users.docs.length > 0) {
      const user = users.docs[0]
      isCoach = user.roles?.includes('coach') || false

      if (isCoach) {
        // Find the coach profile
        const coaches = await payload.find({
          collection: 'coaches',
          where: {
            user: {
              equals: user.id,
            },
          },
        })
        coachProfile = coaches.docs[0] || null

        // Check if this player is saved
        if (coachProfile) {
          const savedPlayers = await payload.find({
            collection: 'saved-players',
            where: {
              and: [
                { coach: { equals: coachProfile.id } },
                { player: { equals: parseInt(id) } },
              ],
            },
          })
          isSaved = savedPlayers.docs.length > 0
        }
      }
    }
  }

  // If not authenticated, show limited public view for SEO
  if (!isAuthenticated) {
    return (
      <div className='min-h-svh bg-slate-900 py-12'>
        <div className='container mx-auto px-4 max-w-3xl'>
          {/* Back button */}
          <Link href='/'>
            <Button
              variant='outline'
              className='mb-6 border-slate-600 text-slate-300'
            >
              ← Back
            </Button>
          </Link>

          {/* Public Player Profile */}
          <Card className='bg-slate-800/50 border-slate-700 p-8 mb-8'>
            <div className='text-center space-y-6'>
              {/* Profile Image */}
              {player.profileImage && typeof player.profileImage === 'object' && (
                <div className='flex justify-center'>
                  <div className='w-32 h-32 rounded-full overflow-hidden bg-slate-700'>
                    <img
                      src={player.profileImage.url}
                      alt={`${player.firstName} ${player.lastName}`}
                      className='w-full h-full object-cover'
                    />
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <h1 className='text-4xl font-bold text-white mb-2'>
                  {player.firstName} {player.lastName}
                </h1>
                <p className='text-xl text-slate-400'>
                  Class of {player.graduationYear}
                </p>
              </div>

              {/* Limited Info */}
              <div className='space-y-3 text-slate-300 max-w-md mx-auto'>
                {player.primaryPosition && (
                  <div className='flex items-center justify-center gap-2'>
                    <span className='text-slate-400'>Position:</span>
                    <span className='font-medium capitalize'>
                      {player.primaryPosition.replace('-', ' ')}
                    </span>
                  </div>
                )}
                {player.highSchool && (
                  <div className='flex items-center justify-center gap-2'>
                    <span className='text-slate-400'>School:</span>
                    <span className='font-medium'>{player.highSchool}</span>
                  </div>
                )}
              </div>

              {/* CTA to Sign Up */}
              <div className='pt-6 border-t border-slate-700'>
                <p className='text-slate-400 mb-4'>
                  Sign in to view full profile including stats, highlight videos, and
                  contact information
                </p>
                <div className='flex flex-col gap-3'>
                  <Link href='/sign-in' className='w-full'>
                    <Button className='w-full bg-blue-600 hover:bg-blue-700'>
                      Sign In
                    </Button>
                  </Link>
                  <div className='flex gap-3'>
                    <Link href='/register-player' className='flex-1'>
                      <Button variant='outline' className='w-full border-orange-500 text-orange-500 hover:bg-orange-500/10'>
                        Register as Player
                      </Button>
                    </Link>
                    <Link href='/register-coach' className='flex-1'>
                      <Button variant='outline' className='w-full border-blue-500 text-blue-500 hover:bg-blue-500/10'>
                        Register as Coach
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-svh bg-slate-900 py-12'>
      <div className='container mx-auto px-4 max-w-5xl'>
        {/* Back button */}
        <Link href='/'>
          <Button
            variant='outline'
            className='mb-6 border-slate-600 text-slate-300'
          >
            ← Back
          </Button>
        </Link>

        {/* Player Header */}
        <Card className='bg-slate-800/50 border-slate-700 p-8 mb-8'>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-4xl font-bold text-white mb-2'>
                {player.firstName} {player.lastName}
              </h1>
              <p className='text-xl text-slate-400'>
                Class of {player.graduationYear}
              </p>
            </div>
            {isCoach && (
              <SavePlayerButton
                playerId={player.id}
                initialIsSaved={isSaved}
                variant='default'
                className='bg-blue-600 hover:bg-blue-700'
              />
            )}
          </div>
        </Card>

        {/* Player Details */}
        <div className='grid md:grid-cols-2 gap-8 mb-8'>
          <Card className='bg-slate-800/50 border-slate-700 p-6'>
            <h2 className='text-2xl font-bold text-white mb-4'>
              Athletic Info
            </h2>
            <div className='space-y-3 text-slate-300'>
              {player.primaryPosition && (
                <div>
                  <span className='text-slate-400'>Primary Position:</span>{' '}
                  <span className='font-medium capitalize'>
                    {player.primaryPosition.replace('-', ' ')}
                  </span>
                </div>
              )}
              {player.secondaryPosition && (
                <div>
                  <span className='text-slate-400'>Secondary Position:</span>{' '}
                  <span className='font-medium capitalize'>
                    {player.secondaryPosition.replace('-', ' ')}
                  </span>
                </div>
              )}
              {player.height && (
                <div>
                  <span className='text-slate-400'>Height:</span>{' '}
                  <span className='font-medium'>{player.height}</span>
                </div>
              )}
            </div>
          </Card>

          <Card className='bg-slate-800/50 border-slate-700 p-6'>
            <h2 className='text-2xl font-bold text-white mb-4'>
              Academic & Contact
            </h2>
            <div className='space-y-3 text-slate-300'>
              {player.highSchool && (
                <div>
                  <span className='text-slate-400'>High School:</span>{' '}
                  <span className='font-medium'>{player.highSchool}</span>
                </div>
              )}
              {(player.city || player.state) && (
                <div>
                  <span className='text-slate-400'>Location:</span>{' '}
                  <span className='font-medium'>
                    {player.city}
                    {player.city && player.state && ', '}
                    {player.state}
                  </span>
                </div>
              )}
              {player.weightedGpa && (
                <div>
                  <span className='text-slate-400'>Weighted GPA:</span>{' '}
                  <span className='font-medium'>{player.weightedGpa}</span>
                </div>
              )}
              {player.unweightedGpa && (
                <div>
                  <span className='text-slate-400'>Unweighted GPA:</span>{' '}
                  <span className='font-medium'>{player.unweightedGpa}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Bio */}
        {player.bio && (
          <Card className='bg-slate-800/50 border-slate-700 p-6 mb-8'>
            <h2 className='text-2xl font-bold text-white mb-4'>About</h2>
            <p className='text-slate-300 whitespace-pre-wrap'>{player.bio}</p>
          </Card>
        )}

        {/* Highlight Video */}
        {player.highlightVideo && (
          <Card className='bg-slate-800/50 border-slate-700 p-6 mb-8'>
            <h2 className='text-2xl font-bold text-white mb-4'>
              Highlight Video
            </h2>
            <a
              href={player.highlightVideo}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-400 hover:text-blue-300 underline'
            >
              {player.highlightVideo}
            </a>
          </Card>
        )}

        {/* Coach Notes Section - Only visible to coaches */}
        {isCoach && coachProfile && (
          <CoachNotesSection playerId={id} coachId={coachProfile.id} />
        )}
      </div>
    </div>
  )
}
