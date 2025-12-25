import { currentUser } from '@clerk/nextjs/server'
import { TournamentsPageContent } from '@/components/TournamentsPageContent'
import { findOne, findAll, countDocs } from '@/lib/payload-helpers'
import { Tournament, Player } from '@/payload-types'

interface TournamentsListProps {
  searchParams: {
    filter?: 'all' | 'upcoming' | 'past'
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

  // Filter tournaments based on the filter parameter
  const isUpcoming = (endDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    return end >= today
  }

  const filteredTournaments = tournamentsWithCounts.filter((tournament) => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return isUpcoming(tournament.endDate)
    if (filter === 'past') return !isUpcoming(tournament.endDate)
    return true
  })

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
      attendingIds={attendingIds}
      isPlayer={isPlayer}
      isAuthenticated={isAuthenticated}
    />
  )
}
