import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

// Save a player
export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = clerkUser.publicMetadata?.role as string | undefined
    if (role !== 'coach') {
      return NextResponse.json(
        { error: 'Only coaches can save players' },
        { status: 403 },
      )
    }

    const body = await req.json()
    const { playerId } = body

    if (!playerId) {
      return NextResponse.json(
        { error: 'playerId is required' },
        { status: 400 },
      )
    }

    // Get Payload instance
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Find the PayloadCMS user
    const users = await payload.find({
      collection: 'users',
      where: {
        clerkId: {
          equals: clerkUser.id,
        },
      },
    })

    if (users.docs.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const payloadUser = users.docs[0]!

    // Find the coach profile
    const coaches = await payload.find({
      collection: 'coaches',
      where: {
        user: {
          equals: payloadUser.id,
        },
      },
    })

    if (coaches.docs.length === 0) {
      return NextResponse.json(
        { error: 'Coach profile not found' },
        { status: 404 },
      )
    }

    const coachProfile = coaches.docs[0]!

    // Check if player is already saved
    const existing = await payload.find({
      collection: 'saved-players',
      where: {
        and: [
          { coach: { equals: coachProfile.id } },
          { player: { equals: parseInt(playerId) } },
        ],
      },
    })

    if (existing.docs.length > 0) {
      return NextResponse.json(
        {
          error: 'Player already saved',
          savedPlayer: existing.docs[0],
        },
        { status: 409 },
      )
    }

    // Create saved player record
    const savedPlayer = await payload.create({
      collection: 'saved-players',
      data: {
        coach: coachProfile.id,
        player: parseInt(playerId),
        savedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({ success: true, savedPlayer })
  } catch (error) {
    console.error('Error saving player:', error)
    return NextResponse.json(
      { error: 'Failed to save player' },
      { status: 500 },
    )
  }
}

// Get all saved players for the current coach
export async function GET(req: Request) {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = clerkUser.publicMetadata?.role as string | undefined
    if (role !== 'coach') {
      return NextResponse.json(
        { error: 'Only coaches can view saved players' },
        { status: 403 },
      )
    }

    // Get Payload instance
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Find the PayloadCMS user
    const users = await payload.find({
      collection: 'users',
      where: {
        clerkId: {
          equals: clerkUser.id,
        },
      },
    })

    if (users.docs.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const payloadUser = users.docs[0]!

    // Find the coach profile
    const coaches = await payload.find({
      collection: 'coaches',
      where: {
        user: {
          equals: payloadUser.id,
        },
      },
    })

    if (coaches.docs.length === 0) {
      return NextResponse.json(
        { error: 'Coach profile not found' },
        { status: 404 },
      )
    }

    const coachProfile = coaches.docs[0]!

    // Get all saved players for this coach
    const savedPlayers = await payload.find({
      collection: 'saved-players',
      where: {
        coach: {
          equals: coachProfile.id,
        },
      },
      depth: 2, // Include player details
      sort: '-savedAt',
    })

    return NextResponse.json({ savedPlayers: savedPlayers.docs })
  } catch (error) {
    console.error('Error fetching saved players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved players' },
      { status: 500 },
    )
  }
}
