import { currentUser } from '@clerk/nextjs/server'
import { PlayersPageContent } from '@/components/PlayersPageContent'
import { findOne, findAll, getDb } from '@/lib/payload-helpers'
import { and, gte, lte, like, isNull, desc, asc, sql, inArray, or } from 'drizzle-orm'

interface PlayersListProps {
  searchParams: {
    graduationYears?: string
    positions?: string
    states?: string
    city?: string
    desiredDistances?: string
    desiredLevels?: string
    aauCircuits?: string
    minGpa?: string
    maxGpa?: string
    minHeight?: string
    maxHeight?: string
    minPpg?: string
    maxPpg?: string
    minRpg?: string
    maxRpg?: string
    minApg?: string
    maxApg?: string
    sortBy?: string
    page?: string
  }
}

export async function PlayersList({ searchParams }: PlayersListProps) {
  // Check user role
  const clerkUser = await currentUser()
  const isCoach = clerkUser?.publicMetadata?.role === 'coach'
  const isPlayer = clerkUser?.publicMetadata?.role === 'player'
  let savedPlayerIds: number[] = []
  let currentPlayerId: number | undefined

  // Get current user from database
  const user = clerkUser ? await findOne('users', {
    clerkId: { equals: clerkUser.id }
  }) : null

  if (isCoach && user) {
    const coaches = await findAll('coaches', {
      user: { equals: user.id }
    })

    if (coaches.length > 0) {
      const coachProfile = coaches[0]!

      // Get saved player IDs
      const savedPlayers = await findAll('coach-saved-players', {
        coach: { equals: coachProfile.id }
      })

      savedPlayerIds = savedPlayers.map((sp) => typeof sp.player === 'number' ? sp.player : sp.player?.id).filter((id): id is number => id !== undefined)
    }
  }

  if (isPlayer && user) {
    // Get current player's ID
    const players = await findAll('players', {
      user: { equals: user.id }
    })

    if (players.length > 0) {
      currentPlayerId = players[0]!.id
    }
  }

  // Use direct Drizzle access for complex filtering
  const { db, tables } = await getDb()
  const playersTable = tables.players

  // Build dynamic where clause based on filters
  const conditions: any[] = [
    isNull(playersTable.deletedAt)
  ]

  // Handle multi-select graduation years
  if (searchParams.graduationYears) {
    const years = searchParams.graduationYears.split(',').filter(Boolean)
    if (years.length > 0) {
      conditions.push(inArray(playersTable.graduationYear, years))
    }
  }

  // Handle multi-select positions (check both primary and secondary)
  if (searchParams.positions) {
    const positions = searchParams.positions.split(',').filter(Boolean)
    if (positions.length > 0) {
      conditions.push(
        or(
          inArray(playersTable.primaryPosition, positions),
          inArray(playersTable.secondaryPosition, positions)
        )
      )
    }
  }

  // Handle multi-select states
  if (searchParams.states) {
    const states = searchParams.states.split(',').filter(Boolean)
    if (states.length > 0) {
      conditions.push(inArray(playersTable.state, states))
    }
  }

  // Handle city search
  if (searchParams.city) {
    conditions.push(like(playersTable.city, `%${searchParams.city}%`))
  }

  // Handle multi-select desired distances
  if (searchParams.desiredDistances) {
    const distances = searchParams.desiredDistances.split(',').filter(Boolean)
    if (distances.length > 0) {
      conditions.push(inArray(playersTable.desiredDistanceFromHome, distances))
    }
  }

  // Handle multi-select desired levels (need to check if ANY of the selected levels match ANY in the player's array)
  if (searchParams.desiredLevels) {
    const levels = searchParams.desiredLevels.split(',').filter(Boolean)
    if (levels.length > 0) {
      // Using SQL to check array overlap
      conditions.push(sql`${playersTable.desiredLevelsOfPlay} && ARRAY[${sql.join(levels.map(l => sql`${l}`), sql`, `)}]::text[]`)
    }
  }

  // Handle multi-select AAU circuits
  if (searchParams.aauCircuits) {
    const circuits = searchParams.aauCircuits.split(',').filter(Boolean)
    if (circuits.length > 0) {
      conditions.push(inArray(playersTable.aauCircuit, circuits))
    }
  }

  // GPA range
  if (searchParams.minGpa) {
    conditions.push(gte(playersTable.weightedGpa, parseFloat(searchParams.minGpa)))
  }
  if (searchParams.maxGpa) {
    conditions.push(lte(playersTable.weightedGpa, parseFloat(searchParams.maxGpa)))
  }

  // Height range
  if (searchParams.minHeight) {
    conditions.push(gte(playersTable.heightInInches, parseInt(searchParams.minHeight)))
  }
  if (searchParams.maxHeight) {
    conditions.push(lte(playersTable.heightInInches, parseInt(searchParams.maxHeight)))
  }

  // Stats ranges
  if (searchParams.minPpg) {
    conditions.push(gte(playersTable.ppg, parseFloat(searchParams.minPpg)))
  }
  if (searchParams.maxPpg) {
    conditions.push(lte(playersTable.ppg, parseFloat(searchParams.maxPpg)))
  }
  if (searchParams.minRpg) {
    conditions.push(gte(playersTable.rpg, parseFloat(searchParams.minRpg)))
  }
  if (searchParams.maxRpg) {
    conditions.push(lte(playersTable.rpg, parseFloat(searchParams.maxRpg)))
  }
  if (searchParams.minApg) {
    conditions.push(gte(playersTable.apg, parseFloat(searchParams.minApg)))
  }
  if (searchParams.maxApg) {
    conditions.push(lte(playersTable.apg, parseFloat(searchParams.maxApg)))
  }

  // Determine sort order
  let orderBy: any
  if (searchParams.sortBy === 'graduation-asc') {
    orderBy = asc(playersTable.graduationYear)
  } else if (searchParams.sortBy === 'graduation-desc') {
    orderBy = desc(playersTable.graduationYear)
  } else if (searchParams.sortBy === 'gpa-desc') {
    orderBy = desc(playersTable.weightedGpa)
  } else if (searchParams.sortBy === 'gpa-asc') {
    orderBy = asc(playersTable.weightedGpa)
  } else if (searchParams.sortBy === 'oldest') {
    orderBy = asc(playersTable.createdAt)
  } else {
    orderBy = desc(playersTable.createdAt) // default: newest first
  }

  // Pagination
  const page = parseInt(searchParams.page || '1')
  const limit = 24
  const offset = (page - 1) * limit

  // Fetch players with filters
  const playersList = await db
    .select()
    .from(playersTable)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset)

  // Get total count for pagination
  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(playersTable)
    .where(and(...conditions))

  const totalDocs = totalResult[0]?.count || 0
  const totalPages = Math.ceil(totalDocs / limit)

  return (
    <PlayersPageContent
      players={playersList}
      totalDocs={totalDocs}
      totalPages={totalPages}
      currentPage={page}
      savedPlayerIds={savedPlayerIds}
      isCoach={isCoach}
      currentPlayerId={currentPlayerId}
    />
  )
}
