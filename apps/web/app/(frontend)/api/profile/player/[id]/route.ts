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

    // Parse the FormData
    const formData = await req.formData()

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

    // Verify the player profile belongs to this user
    const playerProfile = await payload.findByID({
      collection: 'players',
      id: parseInt(id),
      depth: 0, // Get only IDs for relationships, not full objects
    })

    if (!playerProfile || playerProfile.user !== payloadUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this profile' },
        { status: 403 },
      )
    }

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
        // Delete old profile image if it exists
        if (playerProfile.profileImage) {
          try {
            await payload.delete({
              collection: 'media',
              id: typeof playerProfile.profileImage === 'number'
                ? playerProfile.profileImage
                : playerProfile.profileImage.id,
            })
            console.log(`✅ Deleted old profile image: ${playerProfile.profileImage}`)
          } catch (deleteError) {
            console.error('Error deleting old profile image:', deleteError)
            // Continue with upload even if deletion fails
          }
        }

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
        // Continue without updating profile image rather than failing the whole request
      }
    }

    // Get position values and validate them
    const primaryPosition = formData.get('primaryPosition') as string
    const secondaryPosition = formData.get('secondaryPosition') as string
    const validPositions = ['point-guard', 'shooting-guard', 'small-forward', 'power-forward', 'center'] as const
    type Position = typeof validPositions[number]

    // Update the player profile
    const updatedPlayer = await payload.update({
      collection: 'players',
      id: parseInt(id),
      data: {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        graduationYear: formData.get('graduationYear')
          ? parseInt(formData.get('graduationYear') as string)
          : undefined,
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
        primaryPosition: (validPositions.includes(primaryPosition as Position) ? primaryPosition : undefined) as Position | undefined,
        secondaryPosition: (validPositions.includes(secondaryPosition as Position) ? secondaryPosition : undefined) as Position | undefined,
        bio: (formData.get('bio') as string) || undefined,
        highlightVideo: (formData.get('highlightVideo') as string) || undefined,
        ...(profileImageId && { profileImage: profileImageId }),
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
