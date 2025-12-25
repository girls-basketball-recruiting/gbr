import {
  withAuth,
  parseFormData,
  apiSuccess,
  apiValidationError,
  handleApiError,
  apiNotFound,
} from '@/lib/api-helpers'
import { findOne, create, exists } from '@/lib/payload-helpers'
import { uploadProfileImage } from '@/lib/blob-storage'
import { clerkClient } from '@clerk/nextjs/server'

/**
 * Get current user's player profile
 */
export const GET = handleApiError(async () => {
  const [auth, authError] = await withAuth()
  if (authError) return authError

  const player = await findOne('players', {
    user: { equals: auth.dbUser.id },
  })

  if (!player) {
    return apiNotFound('Player profile not found')
  }

  return apiSuccess({ player })
})

/**
 * Create a new player profile
 */
export const POST = handleApiError(async (req: Request) => {
  const [auth, authError] = await withAuth()
  if (authError) return authError

  // Check if player profile already exists
  const hasProfile = await exists('players', {
    user: { equals: auth.dbUser.id },
  })

  if (hasProfile) {
    return apiValidationError('Player profile already exists')
  }

  const [formData, formError] = await parseFormData(req)
  if (formError) return formError

  // Validate required fields
  const graduationYear = formData.get('graduationYear') as string
  if (!graduationYear) {
    return apiValidationError('Graduation year is required')
  }

  // Handle profile image upload
  let profileImageUrl: string | undefined
  const profileImage = formData.get('profileImage') as File | null

  if (profileImage && profileImage.size > 0 && profileImage.name) {
    profileImageUrl = await uploadProfileImage(
      profileImage,
      auth.dbUser.id,
      'player',
      null
    )
  }

  // Parse highlight video URLs
  const highlightVideoUrlsJson = formData.get('highlightVideoUrls') as string
  let highlightVideoUrls: Array<{ url: string; id?: string }> = []
  if (highlightVideoUrlsJson) {
    try {
      const urls = JSON.parse(highlightVideoUrlsJson) as string[]
      highlightVideoUrls = urls
        .filter((url) => url.trim())
        .map((url) => ({ url: url.trim() }))
    } catch (error) {
      console.error('Error parsing highlight video URLs:', error)
    }
  }

  // Get player data from formData
  const playerData = JSON.parse(formData.get('player') as string)

  // Ensure user has 'player' role in Clerk
  const client = await clerkClient()
  await client.users.updateUserMetadata(auth.clerkUser.id, {
    publicMetadata: {
      role: 'player',
    },
  })

  // Create player profile
  const player = await create('players', {
    user: auth.dbUser.id,
    ...playerData,
    email: auth.clerkUser.emailAddresses[0]?.emailAddress,
    highlightVideoUrls,
    profileImageUrl,
  })

  return apiSuccess({ player }, 201)
})
