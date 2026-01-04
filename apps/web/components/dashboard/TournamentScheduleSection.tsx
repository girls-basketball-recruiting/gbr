import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { findById } from '@/lib/payload-helpers'
import type { Tournament } from '@/payload-types'
import { Calendar, ExternalLink, MapPin } from 'lucide-react'
import { ButtonLink } from '../ui/ButtonLink'

interface TournamentScheduleSectionProps {
  playerId: number
}

// Helper to format date range
const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const monthDay: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }

  if (startDate.toDateString() === endDate.toDateString()) {
    return startDate.toLocaleDateString('en-US', monthDay)
  }

  const startFormatted = startDate.toLocaleDateString('en-US', monthDay)
  const endDay = endDate.getDate()

  return `${startFormatted} - ${endDay}`
}

// Helper to format day of week
const formatDayOfWeek = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

// Group tournaments by time period
function groupTournaments(tournaments: Tournament[]) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const oneWeek = new Date(now)
  oneWeek.setDate(now.getDate() + 7)

  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0)

  const groups = {
    thisWeek: [] as Tournament[],
    thisMonth: [] as Tournament[],
    nextMonth: [] as Tournament[],
    later: [] as Tournament[],
  }

  tournaments.forEach((tournament) => {
    const startDate = new Date(tournament.startDate)
    startDate.setHours(0, 0, 0, 0)

    if (startDate < now) {
      // Skip past tournaments
      return
    } else if (startDate <= oneWeek) {
      groups.thisWeek.push(tournament)
    } else if (startDate <= endOfMonth) {
      groups.thisMonth.push(tournament)
    } else if (startDate <= endOfNextMonth) {
      groups.nextMonth.push(tournament)
    } else {
      groups.later.push(tournament)
    }
  })

  return groups
}

// Tournament card component
function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <div className="group relative border rounded-xl p-4 transition-all duration-300 shadow hover:shadow-lg">
      <div className="flex gap-4">
        {/* Date Badge */}
        <div className="flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center shadow-lg">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">
            {formatDayOfWeek(tournament.startDate)}
          </div>
          <div className="text-xl font-black leading-none">
            {new Date(tournament.startDate).getDate()}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">
            {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short' })}
          </div>
        </div>

        {/* Tournament Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-base mb-1 truncate transition-colors">
            {tournament.name}
          </h4>
          <div className="flex items-center gap-1.5 text-sm mb-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {tournament.city}, {tournament.state}
            </span>
          </div>
          <div className="text-xs font-medium">
            {formatDateRange(tournament.startDate, tournament.endDate)}
          </div>
        </div>

        {/* Website Link */}
        {tournament.website && (
          <a
            href={tournament.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 self-start opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors">
              <ExternalLink className="w-4 h-4" />
            </div>
          </a>
        )}
      </div>
    </div>
  )
}

// Time period section
function PeriodSection({ title, tournaments }: { title: string; tournaments: Tournament[] }) {
  if (tournaments.length === 0) return null

  return (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1" />
        <h3 className="text-sm font-black uppercase tracking-wider">
          {title}
        </h3>
        <div className="h-px flex-1" />
      </div>
      <div className="space-y-3">
        {tournaments.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>
    </div>
  )
}

export async function TournamentScheduleSection({ playerId }: TournamentScheduleSectionProps) {
  // Fetch player with populated tournament schedule
  const player = await findById('players', playerId)

  if (!player) {
    return (
      <EmptyState
        icon={<Calendar className="w-8 h-8" />}
        title="Player Not Found"
        description="Unable to load tournament schedule"
      />
    )
  }

  // Extract and filter tournaments
  const tournamentSchedule =
    ((player.tournamentSchedule as unknown as Tournament[])?.filter(
      (t) => typeof t === 'object',
    ) || []) as Tournament[]

  // Filter out past tournaments and sort by date
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const upcomingTournaments = tournamentSchedule
    .filter((t) => new Date(t.endDate) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  // Show empty state if no upcoming tournaments
  if (upcomingTournaments.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="w-8 h-8" />}
        title="No Tournaments Scheduled Yet"
        description="Mark tournaments you're planning to attend to keep track of your schedule"
        action={
          <ButtonLink href="/tournaments" className='mt-4'>
            Browse All Tournaments
          </ButtonLink>
        }
      />
    )
  }

  // Group tournaments by time period
  const groups = groupTournaments(upcomingTournaments)

  return (
    <div>
      <PeriodSection title="This Week" tournaments={groups.thisWeek} />
      <PeriodSection title="This Month" tournaments={groups.thisMonth} />
      <PeriodSection title="Next Month" tournaments={groups.nextMonth} />
      <PeriodSection title="Later" tournaments={groups.later} />

      {/* View All Link */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <ButtonLink href="/tournaments" variant="outline" className='w-full'>
          View All Tournaments
        </ButtonLink>
      </div>
    </div>
  )
}
