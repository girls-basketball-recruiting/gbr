import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const prospects = await payload.find({
      collection: 'prospects',
      limit: 100,
    })

    return NextResponse.json(prospects)
  } catch (error) {
    console.error('Error fetching prospects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prospects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a coach
    const role = clerkUser.publicMetadata?.role as string | undefined
    if (role !== 'coach') {
      return NextResponse.json(
        { error: 'Only coaches can create prospects' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Create the prospect
    const prospect = await payload.create({
      collection: 'prospects',
      data: body,
    })

    return NextResponse.json(prospect, { status: 201 })
  } catch (error) {
    console.error('Error creating prospect:', error)
    return NextResponse.json(
      { error: 'Failed to create prospect' },
      { status: 500 }
    )
  }
}
