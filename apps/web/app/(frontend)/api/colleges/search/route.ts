import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const division = searchParams.get('division')
    const state = searchParams.get('state')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '10')

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Build where clause
    const where: any = {}

    // Search query (school name)
    if (query) {
      where.school = {
        contains: query,
      }
    }

    // Filter by division
    if (division) {
      where.division = {
        equals: division,
      }
    }

    // Filter by state
    if (state) {
      where.state = {
        equals: state,
      }
    }

    // Filter by type
    if (type) {
      where.type = {
        equals: type,
      }
    }

    const colleges = await payload.find({
      collection: 'colleges',
      where,
      limit,
      sort: 'school',
    })

    return NextResponse.json({
      colleges: colleges.docs,
      total: colleges.totalDocs,
      hasMore: colleges.hasNextPage,
    })
  } catch (error) {
    console.error('Error searching colleges:', error)
    return NextResponse.json(
      { error: 'Failed to search colleges' },
      { status: 500 }
    )
  }
}
