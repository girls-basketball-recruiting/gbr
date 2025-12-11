import { NextResponse } from 'next/server'
import { get } from '@vercel/edge-config'

export const runtime = 'edge'

interface College {
  school: string
  city: string
  state: string
  type: string
  conference: string
  division: string
}

export async function GET() {
  try {
    const colleges = await get<College[]>('colleges')
    const lastUpdated = await get<string>('lastUpdated')
    const totalCount = await get<number>('totalCount')

    if (!colleges) {
      return NextResponse.json(
        { error: 'College data not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      colleges,
      metadata: {
        lastUpdated,
        totalCount,
      },
    })
  } catch (error) {
    console.error('Error fetching colleges from Edge Config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch college data' },
      { status: 500 }
    )
  }
}
