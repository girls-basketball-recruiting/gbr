import { currentUser, clerkClient } from '@clerk/nextjs/server'
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

    let payloadUser = users.docs[0]

    // If user doesn't exist in PayloadCMS, create them
    if (!payloadUser) {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress
      if (!email) {
        return NextResponse.json(
          { error: 'No email address found' },
          { status: 400 },
        )
      }

      const roleFromMetadata = clerkUser.publicMetadata?.role as string
      const validRoles = ['admin', 'player', 'coach'] as const
      type Role = typeof validRoles[number]
      const role: Role = validRoles.includes(roleFromMetadata as Role) ? (roleFromMetadata as Role) : 'coach'

      // Update Clerk publicMetadata to ensure it's set (in case webhook failed)
      const client = await clerkClient()
      await client.users.updateUserMetadata(clerkUser.id, {
        publicMetadata: {
          role,
        },
      })
      console.log(`✅ Set Clerk publicMetadata.role = ${role} for user ${clerkUser.id}`)

      payloadUser = await payload.create({
        collection: 'users',
        data: {
          email,
          clerkId: clerkUser.id,
          roles: [role],
          firstName: clerkUser.firstName || undefined,
          lastName: clerkUser.lastName || undefined,
          password:
            Math.random().toString(36).slice(-12) +
            Math.random().toString(36).slice(-12),
        },
      })

      console.log(`✅ Auto-created PayloadCMS user for Clerk ID: ${clerkUser.id}`)
    }

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

    // Validate collegeId is provided
    if (!body.collegeId || body.collegeId === 0) {
      return NextResponse.json(
        { error: 'College selection is required' },
        { status: 400 },
      )
    }

    // Create the coach profile
    const coach = await payload.create({
      collection: 'coaches',
      data: {
        user: payloadUser.id,
        name: body.name,
        collegeId: body.collegeId,
        collegeName: body.collegeName,
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
