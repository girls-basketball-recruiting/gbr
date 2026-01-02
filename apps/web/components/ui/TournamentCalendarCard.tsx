'use client'

import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Users, Bookmark, Lock, Calendar } from 'lucide-react'
import { useState } from 'react'
import { Toggle } from '@workspace/ui/components/toggle'
import Link from 'next/link'
import type { Tournament } from '@/payload-types'
import { formatDateLocationRange } from '@/lib/format-date-location'

interface TournamentCalendarCardProps {
  tournament: Tournament & { attendeeCount?: number }
  isAttending?: boolean
  isPlayer?: boolean
  isAuthenticated?: boolean
  onToggleAttendance?: (tournamentId: number) => Promise<void>
}

const formatDayOfWeek = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

export function TournamentCalendarCard({
  tournament,
  isAttending = false,
  isPlayer = false,
  isAuthenticated = false,
  onToggleAttendance,
}: TournamentCalendarCardProps) {
  const [attending, setAttending] = useState(isAttending)
  const [isLoading, setIsLoading] = useState(false)

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

  const isUpcoming = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(tournament.endDate)
    return endDate >= today
  }

  const upcoming = isUpcoming()

  return (
    <Card
      className={`py-0 group relative bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-800/20 border border-slate-200 dark:border-slate-700 rounded-xl p-6 transition-colors ${
        !upcoming ? 'opacity-75' : ''
      }`}
    >
      <div className='flex gap-4'>
        {/* Date Badge */}
        <div className='shrink-0 w-20 h-20 border-2 border-orange-500 rounded-xl flex flex-col items-center justify-center text-orange-600 dark:text-orange-500'>
          <div className='text-xs font-bold uppercase tracking-wider'>
            {formatDayOfWeek(tournament.startDate)}
          </div>
          <div className='text-2xl font-black leading-none my-0.5'>
            {new Date(tournament.startDate).getDate()}
          </div>
          <div className='text-xs font-bold uppercase tracking-wider'>
            {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short' })}
          </div>
        </div>

        {/* Tournament Info */}
        <div className='flex-1 min-w-0'>
          <h3 className='font-bold text-slate-900 dark:text-white text-xl mb-2'>
            {tournament.name}
          </h3>
          <div className='flex items-center gap-2 text-slate-600 dark:text-slate-300'>
            <Calendar className='w-5 h-5 text-slate-400' />
            <span className='text-sm'>{formatDateLocationRange(tournament.startDate.toString(), tournament.endDate.toString(), tournament.city, tournament.state)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='border-t border-slate-200/50 dark:border-slate-700/50 pt-4'>
        <div className='flex items-center justify-between'>
          {isAuthenticated ? (
            <div className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400'>
              <Users className='w-4 h-4' />
              <span>
                {tournament.attendeeCount ?? 0}{' '}
                {tournament.attendeeCount === 1 ? 'player' : 'players'} attending
              </span>
            </div>
          ) : (
            <div className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400'>
              <Lock className='w-4 h-4' />
              <span>Sign in for tournament stats</span>
            </div>
          )}

          {/* View Details Button */}
          <Link href={`/tournaments/${tournament.id}`}>
            <Button
              variant='outline'
              size='sm'
              className='border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
            >
              View Details
            </Button>
          </Link>
        </div>

        {/* Attendance Toggle */}
        {isAuthenticated && isPlayer && onToggleAttendance && (
          <Toggle
            variant='outline'
            pressed={attending}
            onPressedChange={handleToggle}
            disabled={isLoading}
            className={
              attending
                ? 'bg-orange-600 hover:bg-orange-700 w-full text-white border-transparent'
                : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 w-full'
            }
            aria-label={attending ? 'Mark as Not Attending' : 'Mark as Attending'}
          >
            <Bookmark className={attending ? 'fill-current' : ''} />
            <span className='ml-2'>{attending ? 'Attending' : 'Mark as Attending'}</span>
          </Toggle>
        )}
      </div>
    </Card>
  )
}
