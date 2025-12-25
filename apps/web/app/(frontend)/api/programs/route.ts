import { apiSuccess, handleApiError } from '@/lib/api-helpers'
import { getDb } from '@/lib/payload-helpers'
import { and, eq, like, asc, sql, isNotNull } from 'drizzle-orm'

/**
 * Get all college programs with filtering and pagination
 */
export const GET = handleApiError(async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const division = searchParams.get('division')
  const state = searchParams.get('state')
  const type = searchParams.get('type')
  const hasCoach = searchParams.get('hasCoach')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '24')
  const offset = (page - 1) * limit

  const { db, tables } = await getDb()

  // Build where conditions
  const conditions = []

  if (division) {
    conditions.push(eq(tables.colleges.division, division as any))
  }

  if (state) {
    conditions.push(eq(tables.colleges.state, state))
  }

  if (type) {
    conditions.push(eq(tables.colleges.type, type as any))
  }

  if (search) {
    conditions.push(like(tables.colleges.school, `%${search}%`))
  }

  // Fetch colleges with coach status using a left join
  let query = db
    .select({
      id: tables.colleges.id,
      school: tables.colleges.school,
      city: tables.colleges.city,
      state: tables.colleges.state,
      type: tables.colleges.type,
      conference: tables.colleges.conference,
      division: tables.colleges.division,
      createdAt: tables.colleges.createdAt,
      updatedAt: tables.colleges.updatedAt,
      hasCoach: sql<boolean>`CASE WHEN ${tables.coaches.id} IS NOT NULL THEN true ELSE false END`,
    })
    .from(tables.colleges)
    .leftJoin(tables.coaches, eq(tables.colleges.id, tables.coaches.college))
    .$dynamic()

  // Apply where conditions
  if (conditions.length > 0) {
    query = query.where(and(...conditions))
  }

  // If hasCoach filter is set, only show colleges with coaches
  if (hasCoach === 'true') {
    query = query.where(isNotNull(tables.coaches.id))
  }

  // Execute query with pagination
  const programs = await query
    .groupBy(tables.colleges.id)
    .orderBy(asc(tables.colleges.school))
    .limit(limit)
    .offset(offset)

  // Get total count for pagination
  let countQuery = db
    .select({ count: sql<number>`count(DISTINCT ${tables.colleges.id})` })
    .from(tables.colleges)
    .leftJoin(tables.coaches, eq(tables.colleges.id, tables.coaches.college))
    .$dynamic()

  if (conditions.length > 0) {
    countQuery = countQuery.where(and(...conditions))
  }

  if (hasCoach === 'true') {
    countQuery = countQuery.where(isNotNull(tables.coaches.id))
  }

  const totalResult = await countQuery
  const totalDocs = Number(totalResult[0]?.count || 0)
  const totalPages = Math.ceil(totalDocs / limit)

  return apiSuccess({
    programs,
    totalDocs,
    totalPages,
    page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  })
})
