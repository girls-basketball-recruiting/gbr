import { EmptyState } from '@/components/ui/EmptyState'
import { findById, countDocs } from '@/lib/payload-helpers'
import type { Tournament } from '@/payload-types'
import { Briefcase, Users, Calendar, MapPin } from 'lucide-react'
import { ButtonLink } from '../ui/ButtonLink'
import { formatDateLocationRange } from '@/lib/format-date-location'
import Link from 'next/link'

interface TournamentScheduleSectionProps {
  playerId?: number
  coachId?: number
}

type TournamentWithCounts = {
  tournament: Tournament
  playersCount: number
  coachesCount: number
}

// Helper to get attendee counts for a tournament
async function getTournamentAttendeeCounts(tournamentId: number) {
  const playersCount = await countDocs('players', {
    tournamentSchedule: { contains: tournamentId }
  })

  const coachesCount = await countDocs('coaches', {
    tournamentSchedule: { contains: tournamentId }
  })

  return { playersCount, coachesCount }
}

// Helper to format day of week
const formatDayOfWeek = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

// Group tournaments by time period
function groupTournaments(tournamentsWithCounts: TournamentWithCounts[]) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const oneWeek = new Date(now)
  oneWeek.setDate(now.getDate() + 7)

  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0)

  const groups = {
    happeningNow: [] as TournamentWithCounts[],
    thisWeek: [] as TournamentWithCounts[],
    thisMonth: [] as TournamentWithCounts[],
    nextMonth: [] as TournamentWithCounts[],
    later: [] as TournamentWithCounts[],
  }

  tournamentsWithCounts.forEach((item) => {
    const startDate = new Date(item.tournament.startDate)
    const endDate = new Date(item.tournament.endDate)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    // Tournament is in progress (started but not ended)
    if (startDate <= now && endDate >= now) {
      groups.happeningNow.push(item)
    } else if (startDate < now) {
      // Skip past tournaments (already ended)
      return
    } else if (startDate <= oneWeek) {
      groups.thisWeek.push(item)
    } else if (startDate <= endOfMonth) {
      groups.thisMonth.push(item)
    } else if (startDate <= endOfNextMonth) {
      groups.nextMonth.push(item)
    } else {
      groups.later.push(item)
    }
  })

  return groups
}

// Tournament card component
function TournamentCard({
  tournament,
  playersCount,
  coachesCount
}: TournamentWithCounts) {
  return (
    <div className='group flex items-stretch gap-4'>
      {/* Date Badge */}
      <div className='shrink-0 self-center'>
        <div className='relative w-14 h-14 rounded-lg overflow-hidden bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60 flex flex-col items-center justify-center'>
          <div className='text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400'>
            {formatDayOfWeek(tournament.startDate)}
          </div>
          <div className='text-lg font-black leading-none text-purple-700 dark:text-purple-300'>
            {new Date(tournament.startDate).getDate()}
          </div>
          <div className='text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400'>
            {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short' })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0 flex flex-col justify-center gap-1'>
        {/* Row 1: Name as link */}
        <div className='flex items-center gap-2 min-w-0'>
          <Link
            href={`/tournaments/${tournament.id}`}
            className='font-semibold text-purple-600 dark:text-purple-400 hover:underline truncate'
          >
            {tournament.name}
          </Link>
        </div>

        {/* Row 2: Player/coach counts + Date/Location */}
        <div className='flex items-center gap-2 text-sm text-muted-foreground flex-wrap'>
          <div className='flex items-center gap-1.5'>
            <Users className='w-3.5 h-3.5 text-primary' />
            <span><span className='text-purple-600 dark:text-purple-400 font-medium'>{playersCount}</span> {playersCount === 1 ? 'player' : 'players'}</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <Briefcase className='w-3.5 h-3.5 text-blue-500' />
            <span><span className='text-purple-600 dark:text-purple-400 font-medium'>{coachesCount}</span> {coachesCount === 1 ? 'coach' : 'coaches'}</span>
          </div>
          <span className='text-muted-foreground/40 hidden md:inline'>·</span>
          <span className='hidden md:flex items-center gap-1.5 truncate'>
            <MapPin className='w-3 h-3 shrink-0' />
            <span className='truncate'>
              {formatDateLocationRange(tournament.startDate.toString(), tournament.endDate.toString(), tournament.city, tournament.state)}
            </span>
          </span>
        </div>

        {/* Row 3 Mobile only: Date/Location */}
        <div className='flex md:hidden items-center gap-1.5 text-sm text-muted-foreground'>
          <MapPin className='w-3 h-3 shrink-0' />
          <span className='truncate'>
            {formatDateLocationRange(tournament.startDate.toString(), tournament.endDate.toString(), tournament.city, tournament.state)}
          </span>
        </div>
      </div>
    </div>
  )
}

// Time period section
function PeriodSection({ title, tournaments }: { title: string; tournaments: TournamentWithCounts[] }) {
  if (tournaments.length === 0) return null

  return (
    <div className='mb-8 last:mb-0'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='h-px flex-1' />
        <h3 className='text-sm font-black uppercase tracking-wider'>
          {title}
        </h3>
        <div className='h-px flex-1' />
      </div>
      <div className='space-y-3'>
        {tournaments.map((item) => (
          <TournamentCard key={item.tournament.id} {...item} />
        ))}
      </div>
    </div>
  )
}

export async function TournamentScheduleSection({ playerId, coachId }: TournamentScheduleSectionProps) {
  // Fetch player or coach with populated tournament schedule
  let tournamentSchedule: Tournament[] = []

  if (playerId) {
    const player = await findById('players', playerId)
    if (!player) {
      return (
        <EmptyState
          icon={<Calendar className='w-8 h-8' />}
          title='Player Not Found'
          description='Unable to load tournament schedule'
        />
      )
    }
    // Extract and filter tournaments (check truthiness because typeof null === 'object')
    tournamentSchedule =
      ((player.tournamentSchedule as unknown as Tournament[])?.filter(
        (t) => t && typeof t === 'object',
      ) || []) as Tournament[]
  } else if (coachId) {
    const coach = await findById('coaches', coachId)
    if (!coach) {
      return (
        <EmptyState
          icon={<Calendar className='w-8 h-8' />}
          title='Coach Not Found'
          description='Unable to load tournament schedule'
        />
      )
    }
    // Extract and filter tournaments (check truthiness because typeof null === 'object')
    tournamentSchedule =
      ((coach.tournamentSchedule as unknown as Tournament[])?.filter(
        (t) => t && typeof t === 'object',
      ) || []) as Tournament[]
  } else {
    return (
      <EmptyState
        icon={<Calendar className='w-8 h-8' />}
        title='No Profile Provided'
        description='Unable to load tournament schedule'
      />
    )
  }

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
        icon={<Calendar className='w-8 h-8' />}
        title='No Tournaments Scheduled Yet'
        description="Mark tournaments you're planning to attend to keep track of your schedule"
        action={
          <ButtonLink href='/tournaments' variant='purple'>
            Browse All Tournaments
          </ButtonLink>
        }
      />
    )
  }

  // Fetch attendee counts for all tournaments in parallel
  const tournamentsWithCounts = await Promise.all(
    upcomingTournaments.map(async (tournament) => {
      try {
        const counts = await getTournamentAttendeeCounts(tournament.id)
        return { tournament, ...counts }
      } catch (error) {
        console.error(`Failed to fetch counts for tournament ${tournament.id}`, error)
        return { tournament, playersCount: 0, coachesCount: 0 }
      }
    })
  )

  // Group tournaments by time period
  const groups = groupTournaments(tournamentsWithCounts)

  return (
    <div>
      <PeriodSection title='Happening Now' tournaments={groups.happeningNow} />
      <PeriodSection title='This Week' tournaments={groups.thisWeek} />
      <PeriodSection title='This Month' tournaments={groups.thisMonth} />
      <PeriodSection title='Next Month' tournaments={groups.nextMonth} />
      <PeriodSection title='Later' tournaments={groups.later} />
    </div>
  )
}
