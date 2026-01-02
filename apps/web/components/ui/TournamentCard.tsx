'use client'

import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Calendar, Users, Bookmark, Lock } from 'lucide-react'
import { useState } from 'react'
import { Toggle } from '@workspace/ui/components/toggle'
import Link from 'next/link'
import type { Tournament } from '@/payload-types'

interface TournamentCardProps {
  tournament: Tournament & { playerCount?: number; coachCount?: number }
  isAttending?: boolean
  userRole?: 'player' | 'coach' | null
  isAuthenticated?: boolean
  onToggleAttendance?: (tournamentId: number) => Promise<void>
}

export function TournamentCard({
  tournament,
  isAttending = false,
  userRole = null,
  isAuthenticated = false,
  onToggleAttendance,
}: TournamentCardProps) {
  const [attending, setAttending] = useState(isAttending)
  const [isLoading, setIsLoading] = useState(false)

  const formatDateLocationRange = (start: string, end: string, city: string, state: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)

    const startFormatted = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

    if (startDate.toDateString() === endDate.toDateString()) {
      return `${startFormatted} in ${city}, ${state}`
    }

    const endDay = endDate.toLocaleDateString('en-US', {
      day: 'numeric',
    })

    // Check if same month
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startFormatted}-${endDay} in ${city}, ${state}`
    }

    // Different months
    const endFormatted = endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    return `${startFormatted} - ${endFormatted} in ${city}, ${state}`
  }

  const handleToggle = async () => {
    if (!onToggleAttendance) return

    setIsLoading(true)
    try {
      await onToggleAttendance(tournament.id)
      setAttending(!attending)
    } catch (error) {
      console.error('Failed to toggle attendance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card
      className='min-w-72 py-0 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors'
    >
      <div className='p-6'>
        {/* Header */}
        <div>
          <Link href={`/tournaments/${tournament.id}`} className='hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer'>
            <h3 className='text-xl font-semibold text-slate-900 dark:text-white mb-3'>
              {tournament.name}
            </h3>
          </Link>

          {/* Combined Date and Location */}
          <div className='flex items-center gap-2 text-slate-700 dark:text-slate-300'>
            <Calendar className='w-4 h-4 text-slate-500 dark:text-slate-400' />
            <span className='text-sm'>
              {formatDateLocationRange(tournament.startDate, tournament.endDate, tournament.city, tournament.state)}
            </span>
          </div>
        </div>

        {/* Attendance count */}
        <div className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700'>
          {isAuthenticated ? (
            <>
              <Users className='w-4 h-4' />
              <span>
                {userRole === 'player'
                  ? `${tournament.coachCount ?? 0} ${tournament.coachCount === 1 ? 'coach' : 'coaches'} attending`
                  : `${tournament.playerCount ?? 0} ${tournament.playerCount === 1 ? 'player' : 'players'} attending`
                }
              </span>
            </>
          ) : (
            <>
              <Lock className='w-4 h-4' />
              <span>Sign in for tournament stats</span>
            </>
          )}
        </div>

        {/* Attendance toggle */}
        {isAuthenticated && userRole && onToggleAttendance && (
          <Toggle
            variant='outline'
            pressed={attending}
            onPressedChange={handleToggle}
            disabled={isLoading}
            className={
              attending
                ? 'bg-blue-600 hover:bg-blue-700 text-white w-full'
                : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 w-full'
            }
            aria-label={attending ? 'Mark as Not Attending' : 'Mark as Attending'}
          >
            <Bookmark className={attending ? 'fill-current' : ''} />
            <span className='ml-2'>{attending ? 'Attending' : 'Mark as Attending'}</span>
          </Toggle>
        )}

        {!isAuthenticated && (
          <div className='space-y-2'>
            <Button className='w-full bg-orange-600 hover:bg-orange-700 cursor-pointer' asChild>
              <Link href='/register-player'>RSVP as a Player</Link>
            </Button>
            <Button className='w-full bg-blue-600 hover:bg-blue-700 cursor-pointer' asChild>
              <Link href='/register-coach'>RSVP as a Coach</Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
