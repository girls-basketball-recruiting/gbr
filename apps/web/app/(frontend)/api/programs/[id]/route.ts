import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Fetch the college
    const college = await payload.findByID({
      collection: 'colleges',
      id: parseInt(id),
    })

    if (!college) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      )
    }

    // Find coaches for this college
    const coaches = await payload.find({
      collection: 'coaches',
      where: {
        collegeId: {
          equals: parseInt(id),
        },
      },
      depth: 1, // Include profile images
    })

    return NextResponse.json({
      program: college,
      coaches: coaches.docs,
    })
  } catch (error) {
    console.error('Error fetching program:', error)
    return NextResponse.json(
      { error: 'Failed to fetch program' },
      { status: 500 }
    )
  }
}
