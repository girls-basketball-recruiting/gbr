'use client'

import { Card } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Users, Lock, Calendar, CalendarCheck2Icon, Trophy, CalendarPlus2Icon } from 'lucide-react'
import { useState } from 'react'
import { Toggle } from '@workspace/ui/components/toggle'
import type { Tournament } from '@/payload-types'
import { formatDateLocationRange } from '@/lib/format-date-location'
import { ButtonLink } from './ButtonLink'

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
    <Card className={`overflow-hidden p-0 flex flex-col h-full transition-all ${
      !upcoming ? 'opacity-60' : 'hover:shadow-xl hover:-translate-y-1'
    }`}>
      {/* Header Area - Subtle accent background */}
      <div className='relative aspect-[16/9] bg-purple-50 dark:bg-purple-950/40 border-b-2 border-purple-200 dark:border-purple-800 rounded-b-3xl overflow-hidden'>
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='w-20 h-20 rounded-xl bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 flex items-center justify-center'>
            <Trophy className='w-10 h-10 text-purple-400 dark:text-purple-500' />
          </div>
        </div>

        {/* Date Badge - Top Right */}
        <div className='absolute top-3 right-3'>
          <div className='bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg rounded-xl px-3 py-2 text-center min-w-[70px]'>
            <div className='text-[10px] font-bold uppercase tracking-wider text-white/80'>
              {formatDayOfWeek(tournament.startDate)}
            </div>
            <div className='text-xl font-black leading-none text-white my-0.5'>
              {new Date(tournament.startDate).getDate()}
            </div>
            <div className='text-[10px] font-bold uppercase tracking-wider text-white/80'>
              {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short' })}
            </div>
          </div>
        </div>

        {/* Attending Badge - Top Left */}
        {attending && (
          <div className='absolute top-3 left-3 bg-gradient-to-br from-green-500 to-green-600 shadow-lg px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5'>
            <CalendarCheck2Icon className='w-3 h-3' />
            <span>Attending</span>
          </div>
        )}

        {/* Past Event Indicator */}
        {!upcoming && (
          <div className='absolute bottom-3 right-3'>
            <Badge className='bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg border-0 text-white/90 text-xs'>
              Past Event
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className='p-5 pt-0 flex flex-col flex-1'>
        {/* Tournament Name */}
        <div className='mb-4'>
          <h3 className='text-lg font-bold tracking-tight line-clamp-2'>
            {tournament.name}
          </h3>
          <div className='flex items-center gap-2 mt-2 text-sm text-muted-foreground'>
            <Calendar className='w-4 h-4 text-purple-500' />
            <span>{formatDateLocationRange(tournament.startDate.toString(), tournament.endDate.toString(), tournament.city, tournament.state)}</span>
          </div>
        </div>

        {/* Attendee Info */}
        <div className='mb-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800'>
          {isAuthenticated ? (
            <div className='flex items-center gap-2 text-sm'>
              <Users className='w-4 h-4 text-purple-600 dark:text-purple-400' />
              <span className='text-purple-700 dark:text-purple-300 font-medium'>
                {tournament.attendeeCount ?? 0}{' '}
                {tournament.attendeeCount === 1 ? 'player' : 'players'} attending
              </span>
            </div>
          ) : (
            <div className='flex items-center gap-2 text-sm'>
              <Lock className='w-4 h-4 text-purple-600 dark:text-purple-400' />
              <span className='text-purple-700 dark:text-purple-300 font-medium'>Sign in for tournament stats</span>
            </div>
          )}
        </div>

        {/* Actions - pushed to bottom */}
        <div className='mt-auto pt-4 border-t space-y-3'>
          <ButtonLink href={`/tournaments/${tournament.id}`} variant='secondary' className='w-full'>
            View Details
          </ButtonLink>

          {/* Attendance toggle */}
          {isAuthenticated && onToggleAttendance && (
            <Toggle
              variant='outline'
              pressed={attending}
              onPressedChange={handleToggle}
              disabled={isLoading}
              className='w-full justify-center mt-4'
              aria-label={attending ? 'Mark as Not Attending' : 'Mark as Attending'}
            >
              {attending ? <CalendarCheck2Icon className='w-4 h-4' /> : <CalendarPlus2Icon className='w-4 h-4' />}
              <span className='ml-2'>{attending ? 'Attending' : 'Mark as Attending'}</span>
            </Toggle>
          )}
        </div>
      </div>
    </Card>
  )
}
