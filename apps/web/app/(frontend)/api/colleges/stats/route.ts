import { apiSuccess, handleApiError } from '@/lib/api-helpers'
import { getDb } from '@/lib/payload-helpers'
import { sql } from 'drizzle-orm'

/**
 * Get college statistics (totals by division, state, type)
 */
export const GET = handleApiError(async () => {
  const { db, tables } = await getDb()

  // Get total count
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(tables.colleges)
  const total = Number(totalResult[0]?.count || 0)

  // Get count by division
  const divisionStats = await db
    .select({
      division: tables.colleges.division,
      count: sql<number>`count(*)`,
    })
    .from(tables.colleges)
    .groupBy(tables.colleges.division)

  const byDivision: Record<string, number> = {}
  divisionStats.forEach((stat) => {
    if (stat.division) {
      byDivision[stat.division] = Number(stat.count)
    }
  })

  // Get count by state
  const stateStats = await db
    .select({
      state: tables.colleges.state,
      count: sql<number>`count(*)`,
    })
    .from(tables.colleges)
    .groupBy(tables.colleges.state)
    .orderBy(sql`count(*) desc`)

  const byState: Record<string, number> = {}
  stateStats.forEach((stat) => {
    if (stat.state) {
      byState[stat.state] = Number(stat.count)
    }
  })

  // Get count by type
  const typeStats = await db
    .select({
      type: tables.colleges.type,
      count: sql<number>`count(*)`,
    })
    .from(tables.colleges)
    .groupBy(tables.colleges.type)

  const byType: Record<string, number> = {}
  typeStats.forEach((stat) => {
    if (stat.type) {
      byType[stat.type] = Number(stat.count)
    }
  })

  // Get top 10 states
  const topStates = stateStats
    .slice(0, 10)
    .map((stat) => ({
      state: stat.state || '',
      count: Number(stat.count),
    }))

  return apiSuccess({
    total,
    byDivision,
    byState,
    byType,
    topStates,
  })
})
