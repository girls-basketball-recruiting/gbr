import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const division = searchParams.get('division')
    const state = searchParams.get('state')
    const type = searchParams.get('type')
    const hasCoach = searchParams.get('hasCoach')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Build where clause for colleges
    const where: any = {}

    if (division) {
      where.division = { equals: division }
    }

    if (state) {
      where.state = { equals: state }
    }

    if (type) {
      where.type = { equals: type }
    }

    if (search) {
      where.school = { contains: search, options: 'i' }
    }

    // Fetch colleges
    const collegesData = await payload.find({
      collection: 'colleges',
      where: Object.keys(where).length > 0 ? where : undefined,
      limit,
      page,
      sort: 'school',
    })

    // If hasCoach filter is set, we need to fetch coaches and filter
    let programs = collegesData.docs
    let totalDocs = collegesData.totalDocs
    let totalPages = collegesData.totalPages

    if (hasCoach === 'true') {
      // Fetch all coaches to get their college IDs
      const coaches = await payload.find({
        collection: 'coaches',
        limit: 10000, // Get all coaches
      })

      const collegeIdsWithCoaches = new Set(
        coaches.docs.map((coach: any) => coach.collegeId)
      )

      // Filter programs to only those with coaches
      programs = programs.filter((college: any) =>
        collegeIdsWithCoaches.has(college.id)
      )

      // Recalculate totals
      totalDocs = programs.length
      totalPages = Math.ceil(totalDocs / limit)
    }

    // For each program, check if it has a coach
    const coaches = await payload.find({
      collection: 'coaches',
      limit: 10000,
    })

    const collegeIdsWithCoaches = new Set(
      coaches.docs.map((coach: any) => coach.collegeId)
    )

    const programsWithCoachStatus = programs.map((college: any) => ({
      ...college,
      hasCoach: collegeIdsWithCoaches.has(college.id),
    }))

    return NextResponse.json({
      programs: programsWithCoachStatus,
      totalDocs,
      totalPages,
      page,
      hasNextPage: collegesData.hasNextPage,
      hasPrevPage: collegesData.hasPrevPage,
    })
  } catch (error) {
    console.error('Error fetching programs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    )
  }
}
