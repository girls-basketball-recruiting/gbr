import { apiSuccess, handleApiError } from '@/lib/api-helpers'
import { getDb } from '@/lib/payload-helpers'
import { eq, sql, asc } from 'drizzle-orm'

/**
 * Get all tournaments with attendee counts
 */
export const GET = handleApiError(async () => {
  const { db, tables } = await getDb()

  // Fetch all tournaments with attendee counts using a join
  const tournamentsWithCounts = await db
    .select({
      id: tables.tournaments.id,
      name: tables.tournaments.name,
      city: tables.tournaments.city,
      state: tables.tournaments.state,
      startDate: tables.tournaments.startDate,
      endDate: tables.tournaments.endDate,
      description: tables.tournaments.description,
      website: tables.tournaments.website,
      attendeeCount: sql<number>`count(${tables['players-tournaments'].id})`,
    })
    .from(tables.tournaments)
    .leftJoin(
      tables['players-tournaments'],
      eq(tables.tournaments.id, tables['players-tournaments'].tournament)
    )
    .groupBy(tables.tournaments.id)
    .orderBy(asc(tables.tournaments.startDate))

  return apiSuccess({ tournaments: tournamentsWithCounts })
})
