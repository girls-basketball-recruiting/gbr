import type { Tournament } from '@/payload-types'
import { Calendar, MapPin, ExternalLink } from 'lucide-react'
import { ButtonLink } from '../ui/ButtonLink'

interface TournamentListProps {
  tournaments: Tournament[]
  variant?: 'compact' | 'full'
}

const formatDayOfWeek = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)

  if (startDate.toDateString() === endDate.toDateString()) {
    return startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const startFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endFormatted = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startFormatted} - ${endFormatted}`
}

function DateBadge({ date }: { date: string }) {
  const d = new Date(date)
  return (
    <div className='shrink-0 w-14 h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center'>
      <div className='text-[10px] font-bold uppercase tracking-wider text-primary/70'>
        {formatDayOfWeek(date)}
      </div>
      <div className='text-lg font-black leading-none text-primary'>
        {d.getDate()}
      </div>
      <div className='text-[10px] font-bold uppercase tracking-wider text-primary/70'>
        {d.toLocaleDateString('en-US', { month: 'short' })}
      </div>
    </div>
  )
}

export function TournamentList({ tournaments, variant = 'full' }: TournamentListProps) {
  if (!tournaments || tournaments.length === 0) {
    return (
      <p className='text-muted-foreground text-center py-6'>
        No tournaments scheduled
      </p>
    )
  }

  // Filter out past tournaments and sort by date
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const upcomingTournaments = tournaments
    .filter((t) => t && new Date(t.endDate) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  if (upcomingTournaments.length === 0) {
    return (
      <p className='text-muted-foreground text-center py-6'>
        No upcoming tournaments
      </p>
    )
  }

  return (
    <div className='space-y-3'>
      {upcomingTournaments.map((t) => (
        <div
          key={t.id}
          className='flex gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors'
        >
          <DateBadge date={t.startDate} />

          <div className='flex-1 min-w-0'>
            <h4 className='font-semibold truncate mb-1'>
              {t.name}
            </h4>
            <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground'>
              <span className='flex items-center gap-1.5'>
                <Calendar className='w-3.5 h-3.5' />
                {formatDateRange(t.startDate.toString(), t.endDate.toString())}
              </span>
              <span className='flex items-center gap-1.5'>
                <MapPin className='w-3.5 h-3.5' />
                {t.city}, {t.state}
              </span>
            </div>
            {variant === 'full' && (
              <div className='flex gap-2 mt-2'>
                <ButtonLink variant='secondary' size='sm' href={`/tournaments/${t.id}`}>
                  Details
                </ButtonLink>
                {t.website && (
                  <ButtonLink variant='ghost' size='sm' href={t.website} isExternal>
                    <ExternalLink className='w-3.5 h-3.5 mr-1' />
                    Website
                  </ButtonLink>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
