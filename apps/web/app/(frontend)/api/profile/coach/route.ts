import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    // Get the current Clerk user
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get PayloadCMS instance
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Find the user in PayloadCMS
    const users = await payload.find({
      collection: 'users',
      where: {
        clerkId: {
          equals: clerkUser.id,
        },
      },
    })

    if (users.docs.length === 0) {
      return NextResponse.json(
        {
          error:
            'User not found in database. Please try signing out and back in.',
        },
        { status: 404 },
      )
    }

    const payloadUser = users.docs[0]!

    // Check if coach profile already exists
    const existingCoaches = await payload.find({
      collection: 'coaches',
      where: {
        user: {
          equals: payloadUser.id,
        },
      },
    })

    if (existingCoaches.docs.length > 0) {
      return NextResponse.json(
        { error: 'Coach profile already exists' },
        { status: 400 },
      )
    }

    // Parse the request body
    const body = await req.json()

    // Create the coach profile
    const coach = await payload.create({
      collection: 'coaches',
      data: {
        user: payloadUser.id,
        name: body.name,
        university: body.university,
        programName: body.programName || undefined,
        position: body.position || undefined,
        division: body.division || undefined,
        state: body.state || undefined,
        region: body.region || undefined,
        email: body.email || undefined,
        phone: body.phone || undefined,
        bio: body.bio || undefined,
      },
    })

    return NextResponse.json({ success: true, coach }, { status: 201 })
  } catch (error) {
    console.error('Error creating coach profile:', error)
    return NextResponse.json(
      { error: 'Failed to create coach profile' },
      { status: 500 },
    )
  }
}
