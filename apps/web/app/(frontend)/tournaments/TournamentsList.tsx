import { currentUser } from '@clerk/nextjs/server'
import { TournamentsPageContent } from '@/components/TournamentsPageContent'
import { findOne, findAll, countDocs } from '@/lib/payload-helpers'
import { Tournament, Player } from '@/payload-types'

interface TournamentsListProps {
  searchParams: {
    filter?: 'upcoming' | 'past'
  }
}

export async function TournamentsList({ searchParams }: TournamentsListProps) {
  const filter = searchParams.filter || 'upcoming'

  const clerkUser = await currentUser()
  const isPlayer = clerkUser?.publicMetadata?.role === 'player'
  const isAuthenticated = !!clerkUser

  // Fetch all tournaments via Payload
  const tournaments = await findAll('tournaments', {}, { limit: 1000, sort: 'startDate' })

  // Count attendees for each tournament by querying the players collection
  const tournamentsWithCounts = await Promise.all(
    tournaments.map(async (tournament) => {
      const attendeeCount = await countDocs('players', {
        tournamentSchedule: { contains: tournament.id }
      })

      return {
        ...tournament,
        attendeeCount,
      }
    }),
  )

  // Helper functions for tournament status
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isInProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    return today >= start && today <= end
  }

  const isUpcoming = (startDate: string) => {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    return start > today
  }

  const isPast = (endDate: string) => {
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    return today > end
  }

  // Separate in-progress tournaments (for hero section)
  const inProgressTournaments = tournamentsWithCounts.filter((t) =>
    isInProgress(t.startDate, t.endDate)
  )

  // Filter tournaments based on the filter parameter (excluding in-progress from main list)
  const filteredTournaments = tournamentsWithCounts.filter((tournament) => {
    // In-progress tournaments go to the hero section, not the main list
    if (isInProgress(tournament.startDate, tournament.endDate)) return false

    if (filter === 'upcoming') return isUpcoming(tournament.startDate)
    if (filter === 'past') return isPast(tournament.endDate)
    return false
  })

  // Sort past tournaments newest to oldest (by startDate descending)
  if (filter === 'past') {
    filteredTournaments.sort((a, b) =>
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
  }

  // Get player's attending tournaments if they're a player
  let attendingIds: number[] = []
  if (isPlayer && clerkUser) {
    const user = await findOne('users', {
      clerkId: { equals: clerkUser.id }
    })

    if (user) {
      const player = await findOne('players', {
        user: { equals: user.id },
        deletedAt: { equals: null }
      })

      if (player && player.tournamentSchedule) {
        attendingIds = player.tournamentSchedule.map(t => typeof t === 'object' ? t.id : t)
      }
    }
  }

  return (
    <TournamentsPageContent
      tournaments={filteredTournaments as any}
      inProgressTournaments={inProgressTournaments as any}
      attendingIds={attendingIds}
      isPlayer={isPlayer}
      isAuthenticated={isAuthenticated}
    />
  )
}
