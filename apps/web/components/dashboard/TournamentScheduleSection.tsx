import { EmptyState } from '@/components/ui/EmptyState'
import { findById, countDocs } from '@/lib/payload-helpers'
import type { Tournament } from '@/payload-types'
import { Briefcase, Calendar, ExternalLink, Users } from 'lucide-react'
import { ButtonLink } from '../ui/ButtonLink'
import { formatDateLocationRange } from '@/lib/format-date-location'
import { H4, P } from '../ui/typography'

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
    <div className='group relative bg-accent rounded-xl p-4'>
      <div className='flex gap-4'>
        {/* Date Badge */}
        <div className='shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center shadow-lg'>
          <div className='text-[10px] font-bold uppercase tracking-wider opacity-90'>
            {formatDayOfWeek(tournament.startDate)}
          </div>
          <div className='text-xl font-black leading-none'>
            {new Date(tournament.startDate).getDate()}
          </div>
          <div className='text-[10px] font-bold uppercase tracking-wider opacity-90'>
            {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short' })}
          </div>
        </div>

        {/* Tournament Info */}
        <div className='flex-1 min-w-0'>
          <H4 className='mb-1 truncate'>
            {tournament.name}
          </H4>
          <div className='flex items-center gap-2 mb-2'>
            <Calendar className='w-5 h-5' />
            <P>{formatDateLocationRange(tournament.startDate.toString(), tournament.endDate.toString(), tournament.city, tournament.state)}</P>
          </div>

          {/* Attendee Counts */}
          <div className='flex items-center gap-5 text-sm mb-4 opacity-80'>
            <div className='flex items-center gap-2'>
              <Users className='w-4 h-4 text-primary' />
              <span><strong>{playersCount}</strong> {playersCount === 1 ? 'player' : 'players'}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Briefcase className='w-4 h-4 text-blue-500' />
              <span><strong>{coachesCount}</strong> {coachesCount === 1 ? 'coach' : 'coaches'}</span>
            </div>
          </div>

          <div className='flex gap-3'>
            <ButtonLink variant='purple' size='sm' href={`/tournaments/${tournament.id}`}>
              View Tournament Details
            </ButtonLink>
            {tournament.website && (
              <ButtonLink variant='outline' size='sm' href={tournament.website} isExternal>
                <ExternalLink className='w-4 h-4 mr-2' />
                Tournament Website
              </ButtonLink>
            )}
          </div>
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
