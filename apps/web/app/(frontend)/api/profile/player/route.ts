import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Find the player profile
    const players = await payload.find({
      collection: 'players',
      where: {
        user: {
          equals: payloadUser.id,
        },
      },
      depth: 2, // Include related data like tournament schedule
    })

    if (players.docs.length === 0) {
      return NextResponse.json({ error: 'Player profile not found' }, { status: 404 })
    }

    return NextResponse.json({ player: players.docs[0] })
  } catch (error) {
    console.error('Error fetching player profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player profile' },
      { status: 500 },
    )
  }
}

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
        // Check if it's a HEIF format error
        const errorMessage = uploadError instanceof Error ? uploadError.message : String(uploadError)
        if (errorMessage.includes('heif') || errorMessage.includes('HEIF')) {
          console.warn('HEIF image format not supported. Please convert to JPG/PNG.')
        }
        // Continue without profile image rather than failing the whole request
      }
    }

    // Get position values and validate them
    const primaryPosition = formData.get('primaryPosition') as string
    const secondaryPosition = formData.get('secondaryPosition') as string
    const validPositions = ['point-guard', 'shooting-guard', 'small-forward', 'power-forward', 'center'] as const
    type Position = typeof validPositions[number]

    // Parse highlight video URLs
    const highlightVideoUrlsJson = formData.get('highlightVideoUrls') as string
    let highlightVideoUrls: Array<{ url: string }> | undefined
    if (highlightVideoUrlsJson) {
      try {
        const urls = JSON.parse(highlightVideoUrlsJson) as string[]
        highlightVideoUrls = urls.filter(url => url.trim()).map(url => ({ url: url.trim() }))
      } catch (error) {
        console.error('Error parsing highlight video URLs:', error)
      }
    }

    // Create the player profile
    const graduationYearValue = formData.get('graduationYear') as string
    const parsedGraduationYear = parseInt(graduationYearValue)

    // Validate graduation year
    if (!graduationYearValue || isNaN(parsedGraduationYear)) {
      return NextResponse.json(
        { error: 'Graduation year is required' },
        { status: 400 }
      )
    }

    console.log('Creating player with graduationYear:', {
      raw: graduationYearValue,
      parsed: parsedGraduationYear,
      isNaN: isNaN(parsedGraduationYear)
    })

    const player = await payload.create({
      collection: 'players',
      data: {
        user: payloadUser.id,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        graduationYear: parsedGraduationYear,
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
        highlightVideoUrls,
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
