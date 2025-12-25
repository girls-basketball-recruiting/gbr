import { apiSuccess, apiNotFound, handleApiError } from '@/lib/api-helpers'
import { getDb } from '@/lib/payload-helpers'
import { eq, sql } from 'drizzle-orm'

/**
 * Get a specific tournament by ID with attendee count
 */
export const GET = handleApiError(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const { db, tables } = await getDb()

  // Fetch tournament with attendee count
  const tournamentResult = await db
    .select({
      id: tables.tournaments.id,
      name: tables.tournaments.name,
      city: tables.tournaments.city,
      state: tables.tournaments.state,
      startDate: tables.tournaments.startDate,
      endDate: tables.tournaments.endDate,
      description: tables.tournaments.description,
      website: tables.tournaments.website,
      createdAt: tables.tournaments.createdAt,
      updatedAt: tables.tournaments.updatedAt,
      attendeeCount: sql<number>`count(${tables['players-tournaments'].id})`,
    })
    .from(tables.tournaments)
    .leftJoin(
      tables['players-tournaments'],
      eq(tables.tournaments.id, tables['players-tournaments'].tournament)
    )
    .where(eq(tables.tournaments.id, parseInt(id)))
    .groupBy(tables.tournaments.id)

  if (tournamentResult.length === 0) {
    return apiNotFound('Tournament not found')
  }

  return apiSuccess({ tournament: tournamentResult[0] })
})
