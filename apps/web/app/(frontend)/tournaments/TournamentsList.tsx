import { currentUser } from '@clerk/nextjs/server'
import { TournamentsPageContent } from '@/components/TournamentsPageContent'
import { findOne, getDb, countDocs } from '@/lib/payload-helpers'
import { and, gte, lte, inArray, asc, desc, sql } from 'drizzle-orm'

interface TournamentsListProps {
  searchParams: {
    states?: string
    startDate?: string
    endDate?: string
    hasPlayers?: string
    hasCoaches?: string
    includePast?: string
    sortBy?: string
    page?: string
  }
}

export async function TournamentsList({ searchParams }: TournamentsListProps) {
  const clerkUser = await currentUser()
  const isPlayer = clerkUser?.publicMetadata?.role === 'player'
  const isAuthenticated = !!clerkUser

  const { db, tables } = await getDb()
  const tournamentsTable = tables.tournaments

  // Date references
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]
  const includePast = searchParams.includePast === 'true'

  // ============================================
  // SEPARATE QUERY: Fetch in-progress tournaments
  // ============================================
  const inProgressList = await db
    .select()
    .from(tournamentsTable)
    .where(
      and(
        lte(tournamentsTable.startDate, todayStr),
        gte(tournamentsTable.endDate, todayStr)
      )
    )
    .orderBy(asc(tournamentsTable.startDate))

  // Get counts for in-progress tournaments
  const inProgressCountsPromises = inProgressList.map(async (tournament) => {
    const playerCount = await countDocs('players', {
      tournamentSchedule: { contains: tournament.id },
      deletedAt: { equals: null }
    })
    return { id: tournament.id, playerCount }
  })
  const inProgressCounts = await Promise.all(inProgressCountsPromises)
  const inProgressCountMap = new Map(inProgressCounts.map(c => [c.id, c.playerCount]))

  const inProgressTournaments = inProgressList.map(t => ({
    ...t,
    attendeeCount: inProgressCountMap.get(t.id) || 0,
    coachCount: 0,
  }))

  // ============================================
  // MAIN QUERY: Paginated tournaments
  // ============================================
  const conditions: any[] = []

  // Only show future/current tournaments unless includePast is true
  if (!includePast) {
    // Show tournaments that haven't ended yet
    conditions.push(gte(tournamentsTable.endDate, todayStr))
  }

  // Custom date range filter
  if (searchParams.startDate) {
    conditions.push(gte(tournamentsTable.startDate, searchParams.startDate))
  }
  if (searchParams.endDate) {
    conditions.push(lte(tournamentsTable.endDate, searchParams.endDate))
  }

  // State filter
  if (searchParams.states) {
    const states = searchParams.states.split(',').filter(Boolean)
    if (states.length > 0) {
      conditions.push(inArray(tournamentsTable.state, states))
    }
  }

  // Determine sort order
  let orderBy: any
  switch (searchParams.sortBy) {
    case 'date-desc':
      orderBy = desc(tournamentsTable.startDate)
      break
    case 'name-asc':
      orderBy = asc(tournamentsTable.name)
      break
    case 'name-desc':
      orderBy = desc(tournamentsTable.name)
      break
    default:
      orderBy = asc(tournamentsTable.startDate)
  }

  // Pagination
  const page = parseInt(searchParams.page || '1')
  const limit = 24
  const offset = (page - 1) * limit

  // Fetch tournaments
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  const tournamentsList = await db
    .select()
    .from(tournamentsTable)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset)

  // Get total count for pagination
  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tournamentsTable)
    .where(whereClause)

  const totalDocs = totalResult[0]?.count || 0
  const totalPages = Math.ceil(totalDocs / limit)

  // Get attendee counts for main list
  const countsPromises = tournamentsList.map(async (tournament) => {
    const [playerCount, coachCount] = await Promise.all([
      countDocs('players', {
        tournamentSchedule: { contains: tournament.id },
        deletedAt: { equals: null }
      }),
      countDocs('coaches', {
        tournamentSchedule: { contains: tournament.id }
      })
    ])
    return { id: tournament.id, playerCount, coachCount }
  })

  const counts = await Promise.all(countsPromises)
  const playerCountMap = new Map<number, number>()
  const coachCountMap = new Map<number, number>()

  for (const { id, playerCount, coachCount } of counts) {
    playerCountMap.set(id, playerCount)
    coachCountMap.set(id, coachCount)
  }

  // Add counts to tournaments
  type TournamentWithCounts = typeof tournamentsList[number] & {
    attendeeCount: number
    coachCount: number
  }

  let tournamentsWithCounts: TournamentWithCounts[] = tournamentsList.map(tournament => ({
    ...tournament,
    attendeeCount: playerCountMap.get(tournament.id) || 0,
    coachCount: coachCountMap.get(tournament.id) || 0,
  }))

  // Filter by has players/coaches attending (post-query filter)
  // Note: These filters affect displayed count but pagination is based on DB query
  const hasPostQueryFilters = searchParams.hasPlayers === 'true' || searchParams.hasCoaches === 'true'

  if (searchParams.hasPlayers === 'true') {
    tournamentsWithCounts = tournamentsWithCounts.filter(t => t.attendeeCount > 0)
  }
  if (searchParams.hasCoaches === 'true') {
    tournamentsWithCounts = tournamentsWithCounts.filter(t => t.coachCount > 0)
  }

  // Sort by attendee count if requested
  if (searchParams.sortBy === 'attendees-desc') {
    tournamentsWithCounts.sort((a, b) => b.attendeeCount - a.attendeeCount)
  } else if (searchParams.sortBy === 'attendees-asc') {
    tournamentsWithCounts.sort((a, b) => a.attendeeCount - b.attendeeCount)
  }

  // Adjust counts if post-query filters were applied
  const displayedCount = hasPostQueryFilters ? tournamentsWithCounts.length : totalDocs
  const displayedPages = hasPostQueryFilters ? 1 : totalPages

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
      tournaments={tournamentsWithCounts as any}
      inProgressTournaments={inProgressTournaments as any}
      totalDocs={displayedCount}
      totalPages={displayedPages}
      currentPage={page}
      attendingIds={attendingIds}
      isPlayer={isPlayer}
      isAuthenticated={isAuthenticated}
    />
  )
}
