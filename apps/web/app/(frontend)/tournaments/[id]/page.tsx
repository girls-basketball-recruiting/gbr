import { notFound } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Calendar, ExternalLink, Users } from 'lucide-react'
import type { Metadata } from 'next'
import { findById, findAll, findOne } from '@/lib/payload-helpers'
import { AttendanceBadge } from '@/components/AttendanceBadge'
import { TournamentAttendeesTable } from './TournamentAttendeesTable'
import { formatDateLocationRange } from '@/lib/format-date-location'

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

  // Check if tournament is in the past
  const isPast = new Date(tournament.endDate) < new Date()

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4'>
      <div className='container mx-auto max-w-4xl'>
        {/* Main Content */}
        <div className='space-y-8'>
          {/* Title & Location */}
          <div>
            <h1 className='text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4'>
              {tournament.name}
            </h1>

            <div className='flex items-center gap-2 text-lg text-slate-600 dark:text-slate-300'>
              <Calendar className='w-5 h-5 text-slate-400' />
              <span>{formatDateLocationRange(tournament.startDate.toString(), tournament.endDate.toString(), tournament.city, tournament.state)}</span>
            </div>
          </div>

          {/* Description */}
          {tournament.description && (
            <div className='border-t border-slate-200 dark:border-slate-700 pt-8'>
              <h2 className='text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-4'>
                About This Tournament
              </h2>
              <p className='text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap'>
                {tournament.description}
              </p>
            </div>
          )}

          {/* Attendance sections - only for authenticated users */}
          {clerkUser && userRole && (
            <div className='border-t border-slate-200 dark:border-slate-700 pt-8 space-y-8'>
              {/* Players Attending */}
              <div>
                <h2 className='text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-4'>
                  {userRole === 'player'
                    ? `${players.length} ${players.length === 1 ? 'other player' : 'other players'} attending`
                    : `Players Attending (${players.length})`
                  }
                </h2>
                {players.length > 0 ? (
                  <TournamentAttendeesTable
                    attendees={players.map(p => ({
                      id: p.id,
                      name: `${p.firstName} ${p.lastName}`,
                      detail: p.highSchool || 'N/A',
                      profileUrl: `/players/${p.id}`
                    }))}
                  />
                ) : (
                  <p className='text-slate-600 dark:text-slate-400'>No players attending yet</p>
                )}
              </div>

              {/* Coaches Attending */}
              {userRole === 'coach' ? (
                <div>
                  <h2 className='text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-4'>
                    {coaches.length} {coaches.length === 1 ? 'other coach' : 'other coaches'} attending
                  </h2>
                  {coaches.length > 0 ? (
                    <TournamentAttendeesTable
                      attendees={coaches.map(c => ({
                        id: c.id,
                        name: `${c.firstName} ${c.lastName}`,
                        detail: `${c.collegeName} - ${c.jobTitle}`,
                        profileUrl: `/coaches/${c.id}`
                      }))}
                    />
                  ) : (
                    <p className='text-slate-600 dark:text-slate-400'>No coaches attending yet</p>
                  )}
                </div>
              ) : (
                <div className='flex items-center gap-2 text-slate-600 dark:text-slate-400'>
                  <Users className='w-5 h-5' />
                  <span>{coaches.length} {coaches.length === 1 ? 'coach' : 'coaches'} attending</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className='border-t border-slate-200 dark:border-slate-700 pt-8 flex flex-wrap gap-4'>
            {tournament.website && (
              <a
                href={tournament.website}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-block'
              >
                <Button variant='outline' size='lg'>
                  <ExternalLink className='w-4 h-4 mr-2' />
                  Tournament Website
                </Button>
              </a>
            )}

            {currentUserId && userRole && !isPast && (
              <AttendanceBadge
                tournamentId={parseInt(id)}
                isAttending={isAttending}
                size='lg'
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
