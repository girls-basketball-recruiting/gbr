import { getDb, findOne, findAll } from '@/lib/payload-helpers'
import { ProgramsPageContent } from '@/components/ProgramsPageContent'
import { and, like, desc, asc, sql, isNotNull, inArray } from 'drizzle-orm'
import { currentUser } from '@clerk/nextjs/server'

interface ProgramsListProps {
  searchParams: {
    divisions?: string
    states?: string
    conferences?: string
    type?: string
    hasCoach?: string
    search?: string
    page?: string
    sortBy?: string
    pageSize?: string
  }
}

export async function ProgramsList({ searchParams }: ProgramsListProps) {
  // Use direct Drizzle access for complex filtering
  const { db, tables } = await getDb()
  const collegesTable = tables.colleges
  const coachesTable = tables.coaches

  // Build where conditions
  const conditions: any[] = []

  // Handle multi-select divisions
  if (searchParams.divisions) {
    const divisionArray = searchParams.divisions.split(',').filter(Boolean)
    if (divisionArray.length > 0) {
      conditions.push(inArray(collegesTable.division, divisionArray))
    }
  }

  // Handle multi-select states
  if (searchParams.states) {
    const stateArray = searchParams.states.split(',').filter(Boolean)
    if (stateArray.length > 0) {
      conditions.push(inArray(collegesTable.state, stateArray))
    }
  }

  // Handle multi-select conferences
  if (searchParams.conferences) {
    const conferenceArray = searchParams.conferences.split(',').filter(Boolean)
    if (conferenceArray.length > 0) {
      conditions.push(inArray(collegesTable.conference, conferenceArray))
    }
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
  const pageSize = parseInt(searchParams.pageSize || '24')
  const limit = pageSize
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

  // Fetch saved programs for current player
  let savedProgramIds = new Set<number>()
  const clerkUser = await currentUser()
  if (clerkUser && clerkUser.publicMetadata?.role === 'player') {
    const payloadUser = await findOne('users', {
      clerkId: { equals: clerkUser.id },
    })

    if (payloadUser) {
      const playerRecords = await findAll('players', {
        user: { equals: payloadUser.id },
      })

      const player = playerRecords[0]
      if (player) {
        const savedPrograms = await findAll('player-saved-programs', {
          player: { equals: player.id },
        })

        // Extract college IDs, handling both number and object cases
        const collegeIds = savedPrograms
          .map((sp: any) =>
            typeof sp.college === 'number' ? sp.college : sp.college?.id
          )
          .filter((id): id is number => id !== undefined)

        savedProgramIds = new Set(collegeIds)
      }
    }
  }

  return (
    <ProgramsPageContent
      programs={programsWithCoachStatus}
      totalDocs={totalDocs}
      totalPages={totalPages}
      currentPage={page}
      savedProgramIds={savedProgramIds}
    />
  )
}
