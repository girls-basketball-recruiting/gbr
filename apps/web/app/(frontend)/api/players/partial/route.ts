import {
  parseFormData,
  parseJsonBody,
  apiSuccess,
  apiValidationError,
  handleApiError,
} from '@/lib/api-helpers'
import { findOne, create, updateById } from '@/lib/payload-helpers'
import { uploadProfileImage } from '@/lib/blob-storage'
import { clerkClient } from '@clerk/nextjs/server'

/**
 * Save partial player profile data (step-by-step onboarding)
 */
export const POST = handleApiError(async (req: Request) => {
  // Get Clerk user but don't require database user (for onboarding)
  const { currentUser } = await import('@clerk/nextjs/server')
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return apiValidationError('Unauthorized')
  }

  let dbUser = await findOne('users', {
    clerkId: { equals: clerkUser.id },
  })

  // Create user if doesn't exist (race condition with webhook)
  if (!dbUser) {
    // CRITICAL: Get role from Clerk publicMetadata (single source of truth)
    // DO NOT hardcode role - this was causing coach users to be corrupted
    const role = (clerkUser.publicMetadata?.role as 'player' | 'coach' | 'admin') || 'player'

    dbUser = await create('users', {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      roles: [role],
    })
  }

  // Parse request body to get step and data
  const contentType = req.headers.get('content-type') || ''
  let step: number
  let stepData: any

  if (contentType.includes('multipart/form-data')) {
    // Step 1 with image upload
    const [formData, formError] = await parseFormData(req)
    if (formError) return formError
    step = parseInt(formData.get('step') as string) || 1
    stepData = formData
  } else {
    // Steps 2-6 with JSON
    const [body, bodyError] = await parseJsonBody<{
      step: number
      data: any
    }>(req)
    if (bodyError) return bodyError
    step = body.step
    stepData = body.data
  }

  // Find existing player profile
  const existingPlayer = await findOne('players', {
    user: { equals: dbUser.id },
  })

  // Prepare update data based on step
  let updateData: any = {}

  switch (step) {
    case 1: {
      // Basic Info - handle FormData
      const formData = stepData as FormData

      // Handle profile image upload if provided
      let profileImageUrl: string | undefined
      const profileImage = formData.get('profileImage')

      if (
        profileImage &&
        profileImage instanceof File &&
        profileImage.size > 0 &&
        profileImage.name
      ) {
        try {
          // Get existing profile image URL for cleanup
          const existingImageUrl = existingPlayer?.profileImageUrl

          // Upload to Vercel Blob (will auto-delete old image if exists)
          profileImageUrl = await uploadProfileImage(
            profileImage,
            dbUser.id,
            'player',
            existingImageUrl,
          )
        } catch (uploadError) {
          console.error('Error uploading profile image:', uploadError)
        }
      }

      // Get position values
      const primaryPosition = formData.get('primaryPosition') as string
      const secondaryPosition = formData.get('secondaryPosition') as string
      const validPositions = [
        'point-guard',
        'combo-guard',
        'wing',
        'stretch-4',
        'power-4',
        'post',
        'shooting-guard',
        'small-forward',
        'power-forward',
        'center',
      ] as const
      type Position = (typeof validPositions)[number]

      updateData = {
        user: dbUser.id,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email:
          (formData.get('email') as string) ||
          clerkUser.emailAddresses[0]?.emailAddress,
        graduationYear: formData.get('graduationYear') as string,
        primaryPosition: validPositions.includes(primaryPosition as Position)
          ? (primaryPosition as Position)
          : 'point-guard',
        secondaryPosition: validPositions.includes(
          secondaryPosition as Position
        )
          ? (secondaryPosition as Position)
          : undefined,
        heightInInches: formData.get('heightInInches')
          ? parseInt(formData.get('heightInInches') as string)
          : 0,
        weight: formData.get('weight')
          ? parseInt(formData.get('weight') as string)
          : undefined,
        highSchool: formData.get('highSchool') as string,
        city: (formData.get('city') as string) || undefined,
        state: (formData.get('state') as string) || undefined,
      }

      if (profileImageUrl) {
        updateData.profileImageUrl = profileImageUrl
      }
      break
    }

    case 2: {
      // AAU & Awards
      updateData = {
        aauProgram: stepData.aauProgram || undefined,
        aauTeam: stepData.aauTeam || undefined,
        aauCircuit: stepData.aauCircuit || undefined,
        aauCoach: stepData.aauCoach || undefined,
        awards: stepData.awards || undefined,
      }
      break
    }

    case 3: {
      // Contact
      updateData = {
        phoneNumber: stepData.phoneNumber || undefined,
        email: stepData.email || undefined,
        xHandle: stepData.xHandle || undefined,
        instaHandle: stepData.instaHandle || undefined,
        ncaaId: stepData.ncaaId || undefined,
      }
      break
    }

    case 4: {
      // Academic
      updateData = {
        unweightedGpa: stepData.unweightedGpa
          ? parseFloat(stepData.unweightedGpa)
          : undefined,
        weightedGpa: stepData.weightedGpa
          ? parseFloat(stepData.weightedGpa)
          : undefined,
        potentialAreasOfStudy: stepData.potentialAreasOfStudy || undefined,
      }
      break
    }

    case 5: {
      // Preferences
      updateData = {
        desiredLevelsOfPlay: stepData.desiredLevelsOfPlay || undefined,
        desiredGeographicAreas: stepData.desiredGeographicAreas || undefined,
        desiredDistanceFromHome: stepData.desiredDistanceFromHome || undefined,
        interestedInMilitaryAcademies:
          stepData.interestedInMilitaryAcademies || false,
        interestedInUltraHighAcademics:
          stepData.interestedInUltraHighAcademics || false,
        interestedInFaithBased: stepData.interestedInFaithBased || false,
        interestedInAllGirls: stepData.interestedInAllGirls || false,
        interestedInHBCU: stepData.interestedInHBCU || false,
      }
      break
    }

    case 6: {
      // Stats & Media
      const highlightVideoUrls = stepData.highlightVideoUrls
        ?.filter((url: string) => url.trim())
        .map((url: string) => ({ url: url.trim() }))

      updateData = {
        ppg: stepData.ppg ? parseFloat(stepData.ppg) : undefined,
        rpg: stepData.rpg ? parseFloat(stepData.rpg) : undefined,
        apg: stepData.apg ? parseFloat(stepData.apg) : undefined,
        bio: stepData.bio || undefined,
        highlightVideoUrls: highlightVideoUrls || undefined,
      }
      break
    }

    default:
      return apiValidationError('Invalid step number')
  }

  // Ensure user has 'player' role in Clerk (only on step 1)
  if (step === 1 && !existingPlayer) {
    const client = await clerkClient()
    await client.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: {
        role: 'player',
      },
    })
  }

  // Create or update player profile
  let player
  if (existingPlayer) {
    player = await updateById('players', existingPlayer.id, updateData)
  } else {
    player = await create('players', updateData)
  }

  return apiSuccess({ player }, existingPlayer ? 200 : 201)
})
