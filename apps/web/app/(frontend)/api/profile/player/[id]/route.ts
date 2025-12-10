import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

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

    // Verify the player profile belongs to this user
    const playerProfile = await payload.findByID({
      collection: 'players',
      id: parseInt(id),
    })

    if (!playerProfile || playerProfile.user !== payloadUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this profile' },
        { status: 403 },
      )
    }

    // Update the player profile
    const updatedPlayer = await payload.update({
      collection: 'players',
      id: parseInt(id),
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        graduationYear: body.graduationYear
          ? parseInt(body.graduationYear)
          : undefined,
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
        primaryPosition: body.primaryPosition || undefined,
        secondaryPosition: body.secondaryPosition || undefined,
        bio: body.bio || undefined,
        highlightVideo: body.highlightVideo || undefined,
      },
    })

    return NextResponse.json({ success: true, player: updatedPlayer })
  } catch (error) {
    console.error('Error updating player profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    )
  }
}
