import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET() {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get all colleges (could be optimized with aggregation queries)
    const colleges = await payload.find({
      collection: 'colleges',
      limit: 10000,
      pagination: false,
    })

    // Calculate statistics
    const stats = {
      total: colleges.totalDocs,
      byDivision: {} as Record<string, number>,
      byState: {} as Record<string, number>,
      byType: {} as Record<string, number>,
    }

    colleges.docs.forEach((college: any) => {
      // Count by division
      if (college.division) {
        stats.byDivision[college.division] =
          (stats.byDivision[college.division] || 0) + 1
      }

      // Count by state
      if (college.state) {
        stats.byState[college.state] = (stats.byState[college.state] || 0) + 1
      }

      // Count by type
      if (college.type) {
        stats.byType[college.type] = (stats.byType[college.type] || 0) + 1
      }
    })

    // Get top 10 states
    const topStates = Object.entries(stats.byState)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([state, count]) => ({ state, count }))

    return NextResponse.json({
      ...stats,
      topStates,
    })
  } catch (error) {
    console.error('Error getting college stats:', error)
    return NextResponse.json(
      { error: 'Failed to get college stats' },
      { status: 500 }
    )
  }
}
