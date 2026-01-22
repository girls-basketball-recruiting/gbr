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
import { roundToTwoDecimals } from '@/lib/profile-form-helpers'

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

    try {
      // Generate random password - required by Payload auth but not used (Clerk handles auth)
      const randomPassword = Math.random().toString(36).slice(2) +
                            Math.random().toString(36).slice(2) +
                            Math.random().toString(36).slice(2)

      const email = clerkUser.emailAddresses[0]?.emailAddress || ''
      console.log('📝 Creating user with:', {
        clerkId: clerkUser.id,
        email,
        firstName: clerkUser.firstName || 'Unknown',
        lastName: clerkUser.lastName || 'User',
        role,
      })

      dbUser = await create('users', {
        clerkId: clerkUser.id,
        email,
        firstName: clerkUser.firstName || 'Unknown',
        lastName: clerkUser.lastName || 'User',
        roles: [role],
        password: randomPassword,
      })
    } catch (error) {
      // Log full error for debugging
      console.error('❌ Error creating user:', error)
      if (error && typeof error === 'object' && 'data' in error) {
        console.error('Error data:', JSON.stringify((error as any).data, null, 2))
      }

      // If user was just created by webhook or email already exists, fetch it
      if (error && typeof error === 'object' && 'data' in error) {
        const errorData = (error as any).data
        const isDuplicateClerkId = errorData?.errors?.some((e: any) =>
          e.path === 'clerkId' && e.message?.includes('unique')
        )
        const isDuplicateEmail = errorData?.errors?.some((e: any) =>
          e.path === 'email'
        )

        if (isDuplicateClerkId || isDuplicateEmail) {
          console.log('⚠️ User already exists (duplicate clerkId or email), fetching...')
          // Try to find by clerkId first, then by email
          dbUser = await findOne('users', {
            clerkId: { equals: clerkUser.id },
          })
          if (!dbUser && clerkUser.emailAddresses[0]?.emailAddress) {
            dbUser = await findOne('users', {
              email: { equals: clerkUser.emailAddresses[0].emailAddress },
            })
            // Update the existing user's clerkId if found by email
            if (dbUser && !dbUser.clerkId) {
              dbUser = await updateById('users', dbUser.id, {
                clerkId: clerkUser.id,
              })
            }
          }
          if (!dbUser) {
            throw new Error('User not found after duplicate error')
          }
        } else {
          throw error
        }
      } else {
        throw error
      }
    }
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
    // Steps 2-3 with JSON
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
      // Basic Info - handle FormData (includes contact fields)
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

      updateData = {
        user: dbUser.id,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email:
          (formData.get('email') as string) ||
          clerkUser.emailAddresses[0]?.emailAddress,
        graduationYear: formData.get('graduationYear') as string,
        highSchool: formData.get('highSchool') as string,
        city: formData.get('city') as string, // Required
        state: formData.get('state') as string, // Required
        phoneNumber: formData.get('phoneNumber') as string || undefined,
        xHandle: formData.get('xHandle') as string || undefined,
        instaHandle: formData.get('instaHandle') as string || undefined,
      }

      if (profileImageUrl) {
        updateData.profileImageUrl = profileImageUrl
      }
      break
    }

    case 2: {
      // Athletic Profile (Position, Height, AAU + Stats & Media)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔔 STEP 2: Athletic Profile Data Received')
      console.log('Raw stepData:', JSON.stringify(stepData, null, 2))

      // Frontend sends highlightVideoUrls as array of objects: [{ url: "..." }]
      const highlightVideoUrls = stepData.highlightVideoUrls
        ?.filter((item: any) => item?.url?.trim())
        .map((item: any) => ({ url: item.url.trim() }))

      // Get position values
      const primaryPosition = stepData.primaryPosition
      const secondaryPosition = stepData.secondaryPosition
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
        primaryPosition: validPositions.includes(primaryPosition as Position)
          ? (primaryPosition as Position)
          : undefined,
        secondaryPosition: validPositions.includes(secondaryPosition as Position)
          ? (secondaryPosition as Position)
          : undefined,
        heightInInches: stepData.heightInInches
          ? parseInt(stepData.heightInInches)
          : undefined,
        aauProgramName: stepData.aauProgramName || undefined,
        aauTeamName: stepData.aauTeamName || undefined,
        aauCircuit: stepData.aauCircuit || undefined,
        aauCoach: stepData.aauCoach || undefined,
        awards: stepData.awards || undefined,
        ppg: stepData.ppg ? parseFloat(stepData.ppg) : undefined,
        rpg: stepData.rpg ? parseFloat(stepData.rpg) : undefined,
        apg: stepData.apg ? parseFloat(stepData.apg) : undefined,
        bio: stepData.bio || undefined,
        ncaaId: stepData.ncaaId || undefined,
        highlightVideoUrls: highlightVideoUrls || undefined,
      }

      console.log('Prepared updateData:', JSON.stringify(updateData, null, 2))
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      break
    }

    case 3: {
      // Academic Profile (Academic + Preferences)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔔 STEP 3: Academic Profile Data Received')
      console.log('Raw stepData:', JSON.stringify(stepData, null, 2))

      updateData = {
        unweightedGpa: stepData.unweightedGpa
          ? roundToTwoDecimals(parseFloat(stepData.unweightedGpa))
          : undefined,
        weightedGpa: stepData.weightedGpa
          ? roundToTwoDecimals(parseFloat(stepData.weightedGpa))
          : undefined,
        potentialAreasOfStudy: stepData.potentialAreasOfStudy || undefined,
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

      console.log('Prepared updateData:', JSON.stringify(updateData, null, 2))
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
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

  // Track completed steps
  const existingCompletedSteps = existingPlayer?.completedSteps || []
  const completedStepNumbers = existingCompletedSteps.map((s: any) => s.step)

  // Add current step to completedSteps if not already there
  if (!completedStepNumbers.includes(step)) {
    updateData.completedSteps = [...existingCompletedSteps, { step }]
  }

  // Create or update player profile
  let player
  if (existingPlayer) {
    console.log(`📝 Updating existing player ${existingPlayer.id} with step ${step} data`)
    player = await updateById('players', existingPlayer.id, updateData)
    console.log(`✅ Player updated successfully`)
  } else {
    console.log(`📝 Creating new player with step ${step} data`)
    player = await create('players', updateData)
    console.log(`✅ Player created successfully with ID: ${player.id}`)
  }

  console.log('Final player data:', JSON.stringify({
    id: player.id,
    completedSteps: player.completedSteps,
    hasAthletic: !!(player.primaryPosition || player.aauProgramName),
    hasAcademic: !!(player.unweightedGpa || player.potentialAreasOfStudy),
  }, null, 2))

  // Return completedSteps array for frontend
  const updatedCompletedSteps = player.completedSteps?.map((s: any) => s.step) || []

  return apiSuccess(
    { player, completedSteps: updatedCompletedSteps },
    existingPlayer ? 200 : 201
  )
})
