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
    let users = await payload.find({
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
      const role: Role = validRoles.includes(roleFromMetadata as Role) ? (roleFromMetadata as Role) : 'player'

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

    // Parse the FormData
    const formData = await req.formData()

    // Handle profile image upload if provided
    let profileImageId: number | undefined
    const profileImage = formData.get('profileImage')

    // Only process if it's a File with actual content
    if (
      profileImage &&
      profileImage instanceof File &&
      profileImage.size > 0 &&
      profileImage.name
    ) {
      try {
        // Convert File to Buffer for PayloadCMS
        const buffer = Buffer.from(await profileImage.arrayBuffer())

        const uploadedImage = await payload.create({
          collection: 'media',
          data: {
            alt: `${formData.get('firstName')} ${formData.get('lastName')} profile photo`,
          },
          file: {
            data: buffer,
            mimetype: profileImage.type,
            name: profileImage.name,
            size: profileImage.size,
          },
        })
        profileImageId = uploadedImage.id as number
      } catch (uploadError) {
        console.error('Error uploading profile image:', uploadError)
        // Continue without profile image rather than failing the whole request
      }
    }

    // Get position values and validate them
    const primaryPosition = formData.get('primaryPosition') as string
    const secondaryPosition = formData.get('secondaryPosition') as string
    const validPositions = ['point-guard', 'shooting-guard', 'small-forward', 'power-forward', 'center'] as const
    type Position = typeof validPositions[number]

    // Create the player profile
    const player = await payload.create({
      collection: 'players',
      data: {
        user: payloadUser.id,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        graduationYear: parseInt(formData.get('graduationYear') as string),
        city: (formData.get('city') as string) || undefined,
        state: (formData.get('state') as string) || undefined,
        highSchool: formData.get('highSchool') as string,
        height: (formData.get('height') as string) || undefined,
        weightedGpa: formData.get('weightedGpa')
          ? parseFloat(formData.get('weightedGpa') as string)
          : undefined,
        unweightedGpa: formData.get('unweightedGpa')
          ? parseFloat(formData.get('unweightedGpa') as string)
          : undefined,
        primaryPosition: validPositions.includes(primaryPosition as Position) ? (primaryPosition as Position) : 'point-guard',
        secondaryPosition: (validPositions.includes(secondaryPosition as Position) ? secondaryPosition : undefined) as Position | undefined,
        bio: (formData.get('bio') as string) || undefined,
        highlightVideo: (formData.get('highlightVideo') as string) || undefined,
        profileImage: profileImageId,
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
