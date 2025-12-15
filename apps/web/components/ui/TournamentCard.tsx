'use client'

import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Calendar, MapPin, Users, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface Tournament {
  id: number
  name: string
  location: string
  startDate: string
  endDate: string
  description?: string | null
  website?: string | null
  attendeeCount: number
}

interface TournamentCardProps {
  tournament: Tournament
  isAttending?: boolean
  isPlayer?: boolean
  onToggleAttendance?: (tournamentId: number) => Promise<void>
}

export function TournamentCard({
  tournament,
  isAttending = false,
  isPlayer = false,
  onToggleAttendance,
}: TournamentCardProps) {
  const [attending, setAttending] = useState(isAttending)
  const [isLoading, setIsLoading] = useState(false)

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }

    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString('en-US', options)
    }

    const startFormatted = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    const endFormatted = endDate.toLocaleDateString('en-US', options)

    return `${startFormatted} - ${endFormatted}`
  }

  const isUpcoming = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(tournament.endDate)
    return endDate >= today
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

  const upcoming = isUpcoming()

  return (
    <Card
      className={`min-w-72 bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors ${
        !upcoming ? 'opacity-75' : ''
      }`}
    >
      <div className='p-6 space-y-4'>
        {/* Header with badge */}
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              <h3 className='text-xl font-semibold text-white'>
                {tournament.name}
              </h3>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  upcoming
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-600/50'
                    : 'bg-slate-600/20 text-slate-400 border border-slate-600/50'
                }`}
              >
                {upcoming ? 'Upcoming' : 'Past'}
              </span>
            </div>
          </div>
        </div>

        {/* Date and Location */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-slate-300'>
            <Calendar className='w-4 h-4 text-slate-400' />
            <span className='font-medium'>
              {formatDateRange(tournament.startDate, tournament.endDate)}
            </span>
          </div>
          <div className='flex items-center gap-2 text-slate-300'>
            <MapPin className='w-4 h-4 text-slate-400' />
            <span>{tournament.location}</span>
          </div>
        </div>

        {/* Description */}
        {tournament.description && (
          <p className='text-sm text-slate-400 line-clamp-2'>
            {tournament.description}
          </p>
        )}

        {/* Footer */}
        <div className='flex items-center justify-between pt-4 border-t border-slate-700'>
          <div className='flex items-center gap-2 text-sm text-slate-400'>
            <Users className='w-4 h-4' />
            <span>
              {tournament.attendeeCount}{' '}
              {tournament.attendeeCount === 1 ? 'player' : 'players'} attending
            </span>
          </div>

          <div className='flex items-center gap-2'>
            {tournament.website && (
              <Button
                variant='outline'
                size='sm'
                asChild
                className='border-slate-600 hover:bg-slate-700'
              >
                <a
                  href={tournament.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-1'
                >
                  <ExternalLink className='w-3 h-3' />
                  Website
                </a>
              </Button>
            )}

            {isPlayer && onToggleAttendance && (
              <Button
                variant={attending ? 'default' : 'outline'}
                size='sm'
                onClick={handleToggle}
                disabled={isLoading}
                className={
                  attending
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'border-slate-600 hover:bg-slate-700'
                }
              >
                {attending ? 'Attending' : 'Mark as Attending'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
