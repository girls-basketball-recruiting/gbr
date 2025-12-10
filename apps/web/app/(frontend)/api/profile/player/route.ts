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

    // Find or create the user in PayloadCMS
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

    const payloadUser = users.docs[0]

    // Check if player profile already exists
    const existingPlayers = await payload.find({
      collection: 'players',
      where: {
        user: {
          equals: payloadUser.id,
        },
      },
    })

    if (existingPlayers.docs.length > 0) {
      return NextResponse.json(
        { error: 'Player profile already exists' },
        { status: 400 },
      )
    }

    // Parse the request body
    const body = await req.json()

    // Create the player profile
    const player = await payload.create({
      collection: 'players',
      data: {
        user: payloadUser.id,
        firstName: body.firstName,
        lastName: body.lastName,
        graduationYear: parseInt(body.graduationYear),
        city: body.city || undefined,
        state: body.state || undefined,
        highSchool: body.highSchool,
        height: body.height || undefined,
        weightedGpa: body.weightedGpa
          ? parseFloat(body.weightedGpa)
          : undefined,
        unweightedGpa: body.unweightedGpa
          ? parseFloat(body.unweightedGpa)
          : undefined,
        primaryPosition: body.primaryPosition,
        secondaryPosition: body.secondaryPosition || undefined,
        bio: body.bio || undefined,
        highlightVideo: body.highlightVideo || undefined,
      },
    })

    return NextResponse.json({ success: true, player }, { status: 201 })
  } catch (error) {
    console.error('Error creating player profile:', error)
    return NextResponse.json(
      { error: 'Failed to create player profile' },
      { status: 500 },
    )
  }
}
