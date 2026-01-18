import {
  withCoach,
  parseJsonBody,
  parseFormData,
  apiSuccess,
  handleApiError,
} from '@/lib/api-helpers'
import { findAll, create } from '@/lib/payload-helpers'
import {
  extractProfileDataFromFormData,
  normalizeProfileJsonData,
  handleProfileImageUpload,
  getRequiredStringField,
} from '@/lib/profile-form-helpers'

/**
 * Get all prospects for the current coach
 */
export const GET = handleApiError(async () => {
  const [auth, authError] = await withCoach()
  if (authError) return authError

  const prospects = await findAll(
    'coach-prospects',
    { coach: { equals: auth.coachProfile.id } },
    { sort: '-createdAt' }
  )

  return apiSuccess({ prospects })
})

/**
 * Create a new prospect
 * Supports both JSON and FormData (for image upload)
 */
export const POST = handleApiError(async (req: Request) => {
  const [auth, authError] = await withCoach()
  if (authError) return authError

  const contentType = req.headers.get('content-type') || ''
  let profileData: Record<string, any> = {}
  let profileImageUrl: string | undefined

  if (contentType.includes('multipart/form-data')) {
    // Handle FormData with image upload
    const [formData, formError] = await parseFormData(req)
    if (formError) return formError

    // Handle profile image upload first
    profileImageUrl = await handleProfileImageUpload(
      formData,
      `prospect-${Date.now()}`,
      'prospect'
    )

    // Extract all profile fields from FormData using shared helper
    profileData = extractProfileDataFromFormData(formData)

    // Ensure required fields are present (even if empty, let Payload validate)
    if (!profileData.firstName) {
      profileData.firstName = getRequiredStringField(formData, 'firstName')
    }
    if (!profileData.lastName) {
      profileData.lastName = getRequiredStringField(formData, 'lastName')
    }
  } else {
    // Handle JSON body
    const [body, bodyError] = await parseJsonBody(req)
    if (bodyError) return bodyError

    // Normalize JSON data using shared helper
    profileData = normalizeProfileJsonData(body)
  }

  // Build create data with coach reference
  const createData = {
    ...profileData,
    coach: auth.coachProfile.id,
    ...(profileImageUrl && { profileImageUrl }),
  }

  const prospect = await create('coach-prospects', createData)

  return apiSuccess({ prospect }, 201)
})
