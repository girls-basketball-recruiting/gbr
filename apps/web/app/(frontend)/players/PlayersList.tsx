import { currentUser } from '@clerk/nextjs/server'
import { PlayersPageContent } from '@/components/PlayersPageContent'
import { findOne, findAll, getDb } from '@/lib/payload-helpers'
import { and, gte, lte, like, isNull, desc, asc, sql } from 'drizzle-orm'

interface PlayersListProps {
  searchParams: {
    graduationYear?: string
    position?: string
    minGpa?: string
    maxGpa?: string
    minHeight?: string
    maxHeight?: string
    state?: string
    city?: string
    sortBy?: string
    page?: string
  }
}

export async function PlayersList({ searchParams }: PlayersListProps) {
  // Check if user is a coach
  const clerkUser = await currentUser()
  const isCoach = clerkUser?.publicMetadata?.role === 'coach'
  let savedPlayerIds: number[] = []

  if (isCoach && clerkUser) {
    // Find the user and coach profile
    const user = await findOne('users', {
      clerkId: { equals: clerkUser.id }
    })

    if (user) {
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
  }

  // Use direct Drizzle access for complex filtering
  const { db, tables } = await getDb()
  const playersTable = tables.players

  // Build dynamic where clause based on filters
  const conditions: any[] = [
    isNull(playersTable.deletedAt)
  ]

  if (searchParams.graduationYear) {
    conditions.push(sql`${playersTable.graduationYear} = ${searchParams.graduationYear}`)
  }

  if (searchParams.position) {
    conditions.push(sql`${playersTable.primaryPosition} = ${searchParams.position}`)
  }

  if (searchParams.minGpa) {
    conditions.push(gte(playersTable.weightedGpa, parseFloat(searchParams.minGpa)))
  }

  if (searchParams.maxGpa) {
    conditions.push(lte(playersTable.weightedGpa, parseFloat(searchParams.maxGpa)))
  }

  if (searchParams.minHeight) {
    conditions.push(gte(playersTable.heightInInches, parseInt(searchParams.minHeight)))
  }

  if (searchParams.maxHeight) {
    conditions.push(lte(playersTable.heightInInches, parseInt(searchParams.maxHeight)))
  }

  if (searchParams.state) {
    conditions.push(like(playersTable.state, `%${searchParams.state}%`))
  }

  if (searchParams.city) {
    conditions.push(like(playersTable.city, `%${searchParams.city}%`))
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
    />
  )
}
