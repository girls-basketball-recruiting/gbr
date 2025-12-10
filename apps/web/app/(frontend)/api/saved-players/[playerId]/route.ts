import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

// Unsave a player
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ playerId: string }> },
) {
  try {
    const { playerId } = await params
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = clerkUser.publicMetadata?.role as string | undefined
    if (role !== 'coach') {
      return NextResponse.json(
        { error: 'Only coaches can unsave players' },
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

    const payloadUser = users.docs[0]

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

    const coachProfile = coaches.docs[0]

    // Find the saved player record
    const savedPlayers = await payload.find({
      collection: 'saved-players',
      where: {
        and: [
          { coach: { equals: coachProfile.id } },
          { player: { equals: parseInt(playerId) } },
        ],
      },
    })

    if (savedPlayers.docs.length === 0) {
      return NextResponse.json(
        { error: 'Saved player not found' },
        { status: 404 },
      )
    }

    const savedPlayerRecord = savedPlayers.docs[0]

    // Delete the saved player record
    await payload.delete({
      collection: 'saved-players',
      id: savedPlayerRecord.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unsaving player:', error)
    return NextResponse.json(
      { error: 'Failed to unsave player' },
      { status: 500 },
    )
  }
}

// Check if a player is saved
export async function GET(
  req: Request,
  { params }: { params: Promise<{ playerId: string }> },
) {
  try {
    const { playerId } = await params
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = clerkUser.publicMetadata?.role as string | undefined
    if (role !== 'coach') {
      return NextResponse.json(
        { error: 'Only coaches can check saved players' },
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

    const payloadUser = users.docs[0]

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

    const coachProfile = coaches.docs[0]

    // Check if player is saved
    const savedPlayers = await payload.find({
      collection: 'saved-players',
      where: {
        and: [
          { coach: { equals: coachProfile.id } },
          { player: { equals: parseInt(playerId) } },
        ],
      },
    })

    return NextResponse.json({
      isSaved: savedPlayers.docs.length > 0,
      savedPlayer: savedPlayers.docs[0] || null,
    })
  } catch (error) {
    console.error('Error checking saved player:', error)
    return NextResponse.json(
      { error: 'Failed to check saved player' },
      { status: 500 },
    )
  }
}
