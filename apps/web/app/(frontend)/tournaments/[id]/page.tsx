import { notFound } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { Calendar, ExternalLink, Users, Zap } from 'lucide-react'
import type { Metadata } from 'next'
import { findById, findAll, findOne } from '@/lib/payload-helpers'
import { AttendanceBadge } from '@/components/AttendanceBadge'
import { TournamentAttendeesTable } from './TournamentAttendeesTable'
import { formatDateLocationRange } from '@/lib/format-date-location'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { PublicNav } from '@/components/PublicNav'
import { UnauthenticatedCTA } from '@/components/UnauthenticatedCTA'
import { H1, P, MutedText } from '@/components/ui/typography'

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  try {
    const tournament = await findById('tournaments', id)

    if (!tournament) {
      return {
        title: 'Tournament Not Found',
      }
    }

    const title = `${tournament.name} - ${tournament.city}, ${tournament.state}`
    const description = tournament.description || `Basketball tournament in ${tournament.city}, ${tournament.state}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    }
  } catch {
    return {
      title: 'Tournament Details',
    }
  }
}

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clerkUser = await currentUser()

  // Fetch the tournament
  const tournament = await findById('tournaments', id)

  if (!tournament) {
    notFound()
  }

  // Fetch attendees
  const players = await findAll('players', {
    tournamentSchedule: { contains: parseInt(id) }
  })
  const coaches = await findAll('coaches', {
    tournamentSchedule: { contains: parseInt(id) }
  })

  // Check current user's role and attendance status
  let userRole: 'player' | 'coach' | null = null
  let isAttending = false
  let currentUserId: number | null = null

  if (clerkUser) {
    const user = await findOne('users', { clerkId: { equals: clerkUser.id } })

    if (user) {
      if (user.roles?.includes('player')) {
        userRole = 'player'
        const currentPlayer = await findOne('players', { user: { equals: user.id } })

        if (currentPlayer) {
          currentUserId = currentPlayer.id
          if (currentPlayer.tournamentSchedule) {
            const scheduleIds = (currentPlayer.tournamentSchedule as any[])
              .map(t => typeof t === 'object' ? t.id : t)
            isAttending = scheduleIds.includes(parseInt(id))
          }
        }
      } else if (user.roles?.includes('coach')) {
        userRole = 'coach'
        const currentCoach = await findOne('coaches', { user: { equals: user.id } })

        if (currentCoach) {
          currentUserId = currentCoach.id
          if (currentCoach.tournamentSchedule) {
            const scheduleIds = (currentCoach.tournamentSchedule as any[])
              .map(t => typeof t === 'object' ? t.id : t)
            isAttending = scheduleIds.includes(parseInt(id))
          }
        }
      }
    }
  }

  // Check tournament status
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = new Date(tournament.startDate)
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(tournament.endDate)
  endDate.setHours(23, 59, 59, 999)

  const isInProgress = today >= startDate && today <= endDate
  const isPast = today > endDate
  const isLoggedOut = !clerkUser

  return (
    <>
      {isLoggedOut && <PublicNav activePage='tournaments' />}
      <div className={isLoggedOut ? 'py-12 px-4' : 'px-8'}>
        <div className='container mx-auto max-w-4xl'>
          {/* Unauthenticated CTA */}
          {isLoggedOut && (
            <div className='mb-8'>
              <UnauthenticatedCTA
                title='Join the Tournament Network'
                description='Create an account to mark your attendance at tournaments, connect with coaches and players, and build your basketball recruiting profile.'
                variant='premium'
              />
            </div>
          )}

          {/* Happening Now Banner */}
          {isInProgress && (
            <div className='mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 dark:from-green-500/20 dark:via-emerald-500/20 dark:to-teal-500/20 border-2 border-green-300 dark:border-green-700 p-6'>
              {/* Animated background accent */}
              <div className='absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-400/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
              <div className='absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2' />

              <div className='relative flex items-center gap-4'>
                <div className='flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg'>
                  <Zap className='w-7 h-7 text-white' />
                </div>
                <div>
                  <div className='flex items-center gap-3 mb-1'>
                    <span className='inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm'>
                      <span className='relative flex h-2 w-2'>
                        <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75'></span>
                        <span className='relative inline-flex rounded-full h-2 w-2 bg-white'></span>
                      </span>
                      Live Now
                    </span>
                  </div>
                  <p className='text-lg font-semibold text-green-800 dark:text-green-200'>
                    This tournament is happening right now!
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Main Content */}
        <div className='space-y-8'>
          {/* Title & Location */}
          <div>
            <H1 className='text-4xl text-left md:text-5xl mb-4'>
              {tournament.name}
            </H1>

            <div className='flex items-center gap-2 text-lg'>
              <Calendar className='w-5 h-5' />
              <span>{formatDateLocationRange(tournament.startDate.toString(), tournament.endDate.toString(), tournament.city, tournament.state)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className='flex flex-wrap gap-4'>
            {tournament.website && (
              <ButtonLink variant='outline' size='lg' href={tournament.website} isExternal>
                <ExternalLink className='w-4 h-4 mr-2' />
                Tournament Website
              </ButtonLink>
            )}

            {currentUserId && userRole && !isPast && (
              <AttendanceBadge
                tournamentId={parseInt(id)}
                isAttending={isAttending}
                size='lg'
              />
            )}
          </div>

          {/* Description */}
          {tournament.description && (
            <div className='border-t pt-8'>
              <MutedText className='uppercase font-extrabold'>
                About This Tournament
              </MutedText>
              <P className='text-lg whitespace-pre-wrap mt-4'>
                {tournament.description}
              </P>
            </div>
          )}

          {/* Attendance sections - only for authenticated users */}
          {clerkUser && userRole && (
            <div className='border-t pt-8 space-y-8'>
              {/* Players Attending */}
              <div>
                {(() => {
                  // Filter out current user if they're a player
                  const otherPlayers = userRole === 'player' && currentUserId
                    ? players.filter(p => p.id !== currentUserId)
                    : players

                  return (
                    <>
                      <MutedText className='uppercase font-extrabold mb-6'>
                        {userRole === 'player'
                          ? `${otherPlayers.length} ${otherPlayers.length === 1 ? 'other player' : 'other players'} attending`
                          : `Players Attending (${otherPlayers.length})`
                        }
                      </MutedText>
                      {otherPlayers.length > 0 ? (
                        <TournamentAttendeesTable
                          attendees={otherPlayers.map(p => ({
                            id: p.id,
                            name: `${p.firstName} ${p.lastName}`,
                            detail: p.highSchool || 'N/A',
                            profileUrl: `/players/${p.id}`
                          }))}
                        />
                      ) : (
                        <P className='mt-4 pb-8 border-b'>No {players.length === 1 ? 'other ' : ''}players attending yet</P>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Coaches Attending */}
              {userRole === 'coach' ? (
                <div>
                  {(() => {
                    // Filter out current user if they're a coach
                    const otherCoaches = currentUserId
                      ? coaches.filter(c => c.id !== currentUserId)
                      : coaches

                    return (
                      <>
                        <MutedText className='uppercase font-extrabold mb-4'>
                          {otherCoaches.length} {otherCoaches.length === 1 ? 'other coach' : 'other coaches'} attending
                        </MutedText>
                        {otherCoaches.length > 0 ? (
                          <TournamentAttendeesTable
                            attendees={otherCoaches.map(c => ({
                              id: c.id,
                              name: `${c.firstName} ${c.lastName}`,
                              detail: `${c.collegeName} - ${c.jobTitle}`,
                              profileUrl: `/programs/${c.collegeId}/coaches/${c.id}`
                            }))}
                          />
                        ) : (
                          <P className='text-lg leading-relaxed'>No coaches attending yet</P>
                        )}
                      </>
                    )
                  })()}
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <Users className='w-5 h-5' />
                  <span>{coaches.length} {coaches.length === 1 ? 'coach' : 'coaches'} attending</span>
                </div>
              )}
            </div>
          )}

        </div>
        </div>
      </div>
    </>
  )
}
