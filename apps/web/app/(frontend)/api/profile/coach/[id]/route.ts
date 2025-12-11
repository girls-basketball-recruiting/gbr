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

    const payloadUser = users.docs[0]!

    // Verify the coach profile belongs to this user
    const coachProfile = await payload.findByID({
      collection: 'coaches',
      id: parseInt(id),
    })

    if (!coachProfile || coachProfile.user !== payloadUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this profile' },
        { status: 403 },
      )
    }

    // Update the coach profile
    const updatedCoach = await payload.update({
      collection: 'coaches',
      id: parseInt(id),
      data: {
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

    return NextResponse.json({ success: true, coach: updatedCoach })
  } catch (error) {
    console.error('Error updating coach profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    )
  }
}
