import { getDb } from '@/lib/payload-helpers'
import { ProgramsPageContent } from '@/components/ProgramsPageContent'
import { and, like, desc, asc, sql, isNotNull } from 'drizzle-orm'

interface ProgramsListProps {
  searchParams: {
    division?: string
    state?: string
    type?: string
    hasCoach?: string
    search?: string
    page?: string
    sortBy?: string
  }
}

export async function ProgramsList({ searchParams }: ProgramsListProps) {
  // Use direct Drizzle access for complex filtering
  const { db, tables } = await getDb()
  const collegesTable = tables.colleges
  const coachesTable = tables.coaches

  // Build where conditions
  const conditions: any[] = []

  if (searchParams.division) {
    conditions.push(sql`${collegesTable.division} = ${searchParams.division}`)
  }

  if (searchParams.state) {
    conditions.push(sql`${collegesTable.state} = ${searchParams.state}`)
  }

  if (searchParams.type) {
    conditions.push(sql`${collegesTable.type} = ${searchParams.type}`)
  }

  if (searchParams.search) {
    conditions.push(like(collegesTable.school, `%${searchParams.search}%`))
  }

  // Determine sort order
  let orderBy: any
  if (searchParams.sortBy === 'school-desc') {
    orderBy = desc(collegesTable.school)
  } else if (searchParams.sortBy === 'division-asc') {
    orderBy = asc(collegesTable.division)
  } else if (searchParams.sortBy === 'state-asc') {
    orderBy = asc(collegesTable.state)
  } else {
    orderBy = asc(collegesTable.school) // default: alphabetical
  }

  // Pagination
  const page = parseInt(searchParams.page || '1')
  const limit = 24
  const offset = (page - 1) * limit

  // Build query
  let query = db.select().from(collegesTable)

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any
  }

  // Fetch colleges
  const programs = await query
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset)

  // Get total count for pagination
  let countQuery = db.select({ count: sql<number>`count(*)::int` }).from(collegesTable)
  if (conditions.length > 0) {
    countQuery = countQuery.where(and(...conditions)) as any
  }
  const totalResult = await countQuery
  let totalDocs = totalResult[0]?.count || 0
  let totalPages = Math.ceil(totalDocs / limit)

  // Fetch all coaches to determine which programs have coaches
  const allCoaches = await db
    .select({ collegeId: coachesTable.collegeId })
    .from(coachesTable)
    .where(isNotNull(coachesTable.collegeId))

  const collegeIdsWithCoaches = new Set(
    allCoaches.map((coach) => coach.collegeId).filter(Boolean)
  )

  // Filter if hasCoach is set
  let filteredPrograms = programs
  if (searchParams.hasCoach === 'true') {
    filteredPrograms = programs.filter((college) =>
      collegeIdsWithCoaches.has(college.id)
    )
    totalDocs = filteredPrograms.length
    totalPages = Math.ceil(totalDocs / limit)
  }

  // Add hasCoach flag to each program
  const programsWithCoachStatus = filteredPrograms.map((college) => ({
    ...college,
    hasCoach: collegeIdsWithCoaches.has(college.id),
  }))

  return (
    <ProgramsPageContent
      programs={programsWithCoachStatus}
      totalDocs={totalDocs}
      totalPages={totalPages}
      currentPage={page}
    />
  )
}
