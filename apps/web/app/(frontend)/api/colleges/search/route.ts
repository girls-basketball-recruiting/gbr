import { apiSuccess, handleApiError } from '@/lib/api-helpers'
import { getDb } from '@/lib/payload-helpers'
import { and, eq, like, asc, sql } from 'drizzle-orm'

/**
 * Search colleges with filtering
 */
export const GET = handleApiError(async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const division = searchParams.get('division')
  const state = searchParams.get('state')
  const type = searchParams.get('type')
  const limit = parseInt(searchParams.get('limit') || '10')

  const { db, tables } = await getDb()

  // Build where conditions
  const conditions = []

  // Search query (school name)
  if (query) {
    conditions.push(like(tables.colleges.school, `%${query}%`))
  }

  // Filter by division
  if (division) {
    conditions.push(eq(tables.colleges.division, division as any))
  }

  // Filter by state
  if (state) {
    conditions.push(eq(tables.colleges.state, state))
  }

  // Filter by type
  if (type) {
    conditions.push(eq(tables.colleges.type, type as any))
  }

  // Execute query
  const colleges = await db
    .select()
    .from(tables.colleges)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(tables.colleges.school))
    .limit(limit)

  // Get total count for pagination
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(tables.colleges)
    .where(conditions.length > 0 ? and(...conditions) : undefined)

  const total = Number(totalResult[0]?.count || 0)
  const hasMore = colleges.length >= limit

  return apiSuccess({
    colleges,
    total,
    hasMore,
  })
})
