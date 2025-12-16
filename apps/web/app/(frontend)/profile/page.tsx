import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { redirect } from 'next/navigation'
import { CoachProfileView } from '@/components/ui/CoachProfileView'
import { Card } from '@workspace/ui/components/card'
import Image from 'next/image'
import { getPositionLabel } from '@/types/positions'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

export default async function ProfilePage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect('/sign-in')
  }

  // Fetch the user's profile data
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Find the PayloadCMS user
  const users = await payload.find({
    collection: 'users',
    where: {
      clerkId: {
        equals: clerkUser.id,
      },
    },
  })

  if (users.docs.length === 0) {
    return (
      <div className='p-8'>
        <div className='max-w-3xl mx-auto text-center'>
          <p className='text-slate-900 dark:text-white'>User not found. Please contact support.</p>
        </div>
      </div>
    )
  }

  const payloadUser = users.docs[0]!

  // Get role from PayloadCMS user
  const role = payloadUser.roles?.[0]
  const isPlayer = role === 'player'
  const isCoach = role === 'coach'

  if (!isPlayer && !isCoach) {
    return (
      <div className='p-8'>
        <div className='max-w-3xl mx-auto text-center'>
          <p className='text-slate-900 dark:text-white'>No profile found. Please contact support.</p>
        </div>
      </div>
    )
  }

  // Fetch player profile
  if (isPlayer) {
    const players = await payload.find({
      collection: 'players',
      where: {
        user: {
          equals: payloadUser.id,
        },
      },
      depth: 2, // Populate profileImage and tournamentSchedule
    })

    const player = players.docs[0]

    if (!player) {
      redirect('/onboarding/player')
    }

    // Render player profile view (similar to /players/[id])
    return (
      <div className='p-8'>
        <div className='max-w-5xl mx-auto'>
          {/* Edit Profile Button */}
          <div className='mb-4 flex justify-end'>
            <Link href='/profile/edit'>
              <Button variant='outline'>
                Edit Profile
              </Button>
            </Link>
          </div>

          {/* Player Header */}
          <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-8 mb-8'>
            <div className='flex items-start gap-6'>
              {/* Profile Image */}
              {player.profileImage &&
                typeof player.profileImage === 'object' &&
                player.profileImage.url && (
                  <div className='w-24 h-24 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 relative flex-shrink-0'>
                    <Image
                      src={player.profileImage.url}
                      alt={`${player.firstName} ${player.lastName}`}
                      fill
                      className='object-cover'
                    />
                  </div>
                )}

              {/* Player Info */}
              <div>
                <h1 className='text-4xl font-bold text-slate-900 dark:text-white mb-2'>
                  {player.firstName} {player.lastName}
                </h1>
                <p className='text-xl text-slate-600 dark:text-slate-400'>
                  Class of {player.graduationYear}
                </p>
              </div>
            </div>
          </Card>

          {/* Player Details */}
          <div className='grid md:grid-cols-2 gap-8 mb-8'>
            <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6'>
              <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
                Athletic Info
              </h2>
              <div className='space-y-3 text-slate-700 dark:text-slate-300'>
                {player.primaryPosition && (
                  <div>
                    <span className='text-slate-600 dark:text-slate-400'>Primary Position:</span>{' '}
                    <span className='font-medium'>
                      {getPositionLabel(player.primaryPosition)}
                    </span>
                  </div>
                )}
                {player.secondaryPosition && (
                  <div>
                    <span className='text-slate-600 dark:text-slate-400'>Secondary Position:</span>{' '}
                    <span className='font-medium'>
                      {getPositionLabel(player.secondaryPosition)}
                    </span>
                  </div>
                )}
                {player.height && (
                  <div>
                    <span className='text-slate-600 dark:text-slate-400'>Height:</span>{' '}
                    <span className='font-medium'>{player.height}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6'>
              <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
                Academic & Contact
              </h2>
              <div className='space-y-3 text-slate-700 dark:text-slate-300'>
                {player.highSchool && (
                  <div>
                    <span className='text-slate-600 dark:text-slate-400'>High School:</span>{' '}
                    <span className='font-medium'>{player.highSchool}</span>
                  </div>
                )}
                {(player.city || player.state) && (
                  <div>
                    <span className='text-slate-600 dark:text-slate-400'>Location:</span>{' '}
                    <span className='font-medium'>
                      {player.city}
                      {player.city && player.state && ', '}
                      {player.state}
                    </span>
                  </div>
                )}
                {player.weightedGpa && (
                  <div>
                    <span className='text-slate-600 dark:text-slate-400'>Weighted GPA:</span>{' '}
                    <span className='font-medium'>{player.weightedGpa}</span>
                  </div>
                )}
                {player.unweightedGpa && (
                  <div>
                    <span className='text-slate-600 dark:text-slate-400'>Unweighted GPA:</span>{' '}
                    <span className='font-medium'>{player.unweightedGpa}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Bio */}
          {player.bio && (
            <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6 mb-8'>
              <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>About</h2>
              <p className='text-slate-700 dark:text-slate-300 whitespace-pre-wrap'>{player.bio}</p>
            </Card>
          )}

          {/* Tournament Schedule */}
          {player.tournamentSchedule &&
            Array.isArray(player.tournamentSchedule) &&
            player.tournamentSchedule.length > 0 && (
              <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6 mb-8'>
                <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
                  Tournament Schedule
                </h2>
                <div className='space-y-3'>
                  {player.tournamentSchedule.map((tournament: any) => {
                    const t = typeof tournament === 'object' ? tournament : null
                    if (!t) return null

                    const formatDateRange = (start: string, end: string) => {
                      const startDate = new Date(start)
                      const endDate = new Date(end)

                      const options: Intl.DateTimeFormatOptions = {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }

                      if (
                        startDate.toDateString() === endDate.toDateString()
                      ) {
                        return startDate.toLocaleDateString('en-US', options)
                      }

                      const startFormatted = startDate.toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                        },
                      )
                      const endFormatted = endDate.toLocaleDateString(
                        'en-US',
                        options,
                      )

                      return `${startFormatted} - ${endFormatted}`
                    }

                    return (
                      <div
                        key={t.id}
                        className='flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600'
                      >
                        <div>
                          <h3 className='font-semibold text-slate-900 dark:text-white'>{t.name}</h3>
                          <p className='text-sm text-slate-600 dark:text-slate-400'>
                            {formatDateRange(t.startDate, t.endDate)} •{' '}
                            {t.location}
                          </p>
                        </div>
                        {t.website && (
                          <a
                            href={t.website}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm'
                          >
                            View Details →
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}

          {/* Highlight Videos */}
          {player.highlightVideoUrls &&
            Array.isArray(player.highlightVideoUrls) &&
            player.highlightVideoUrls.length > 0 && (
              <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6'>
                <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
                  Highlight Videos
                </h2>
                <div className='space-y-2'>
                  {player.highlightVideoUrls.map((item: any, index: number) => {
                    const url =
                      typeof item === 'object' && item.url ? item.url : item
                    return url ? (
                      <div key={index}>
                        <a
                          href={url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline block'
                        >
                          {url}
                        </a>
                      </div>
                    ) : null
                  })}
                </div>
              </Card>
            )}
        </div>
      </div>
    )
  }

  // Fetch coach profile
  if (isCoach) {
    const coaches = await payload.find({
      collection: 'coaches',
      where: {
        user: {
          equals: payloadUser.id,
        },
      },
      depth: 1, // Populate profileImage relationship
    })

    const coach = coaches.docs[0]

    if (!coach) {
      redirect('/onboarding/coach')
    }

    // Render coach profile view with edit button
    return (
      <div className='p-8'>
        <div className='max-w-5xl mx-auto'>
          {/* Edit Profile Button */}
          <div className='mb-4 flex justify-end'>
            <Link href='/profile/edit'>
              <Button variant='outline' className='border-slate-600'>
                Edit Profile
              </Button>
            </Link>
          </div>

          <CoachProfileView coach={coach} />
        </div>
      </div>
    )
  }

  return null
}
