import {
  withAuth,
  parseFormData,
  apiSuccess,
  apiValidationError,
  handleApiError,
} from '@/lib/api-helpers'
import { create, exists } from '@/lib/payload-helpers'
import { uploadProfileImage } from '@/lib/blob-storage'
import { clerkClient } from '@clerk/nextjs/server'

/**
 * Create a new coach profile
 */
export const POST = handleApiError(async (req: Request) => {
  const [auth, authError] = await withAuth()
  if (authError) return authError

  // Check if coach profile already exists
  const hasProfile = await exists('coaches', {
    user: { equals: auth.dbUser.id },
  })

  if (hasProfile) {
    return apiValidationError('Coach profile already exists')
  }

  const [formData, formError] = await parseFormData(req)
  if (formError) return formError

  // Extract fields from FormData
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const collegeId = parseInt(formData.get('collegeId') as string)
  const collegeName = formData.get('collegeName') as string
  const jobTitle = formData.get('jobTitle') as string | undefined
  const phone = formData.get('phone') as string | undefined
  const bio = formData.get('bio') as string | undefined

  // Validate required fields
  if (!collegeId || collegeId === 0) {
    return apiValidationError('College selection is required')
  }

  // Handle profile image upload
  let profileImageUrl: string | undefined
  const profileImage = formData.get('profileImage') as File | null

  if (profileImage && profileImage.size > 0 && profileImage.name) {
    profileImageUrl = await uploadProfileImage(
      profileImage,
      auth.dbUser.id,
      'coach',
      null
    )
  }

  // Ensure user has 'coach' role in Clerk
  const client = await clerkClient()
  await client.users.updateUserMetadata(auth.clerkUser.id, {
    publicMetadata: {
      role: 'coach',
    },
  })

  // Create coach profile
  const coach = await create('coaches', {
    user: auth.dbUser.id,
    firstName,
    lastName,
    collegeId,
    collegeName,
    jobTitle,
    email: auth.clerkUser.emailAddresses[0]?.emailAddress,
    phone,
    bio,
    profileImageUrl,
  })

  return apiSuccess({ coach }, 201)
})
