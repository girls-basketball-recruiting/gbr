import {
  withCoach,
  parseJsonBody,
  parseFormData,
  apiSuccess,
  apiNotFound,
  apiForbidden,
  handleApiError,
} from '@/lib/api-helpers'
import { findById, updateById, deleteById } from '@/lib/payload-helpers'
import {
  extractProfileDataFromFormData,
  normalizeProfileJsonData,
  handleProfileImageUpload,
} from '@/lib/profile-form-helpers'
import type { CoachProspect } from '@/payload-types'

/**
 * Get a specific prospect by ID
 */
export const GET = handleApiError(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const [auth, authError] = await withCoach()
  if (authError) return authError

  const prospect = await findById('coach-prospects', parseInt(id))

  if (!prospect) {
    return apiNotFound('Prospect not found')
  }

  // Verify the prospect belongs to this coach
  const coachId = typeof prospect.coach === 'object' ? prospect.coach?.id : prospect.coach
  if (coachId !== auth.coachProfile.id) {
    return apiForbidden('Cannot access another coach\'s prospect')
  }

  return apiSuccess({ prospect })
})

/**
 * Update a prospect
 * Supports both JSON and FormData (for image upload)
 */
export const PUT = handleApiError(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const [auth, authError] = await withCoach()
  if (authError) return authError

  const prospect = await findById('coach-prospects', parseInt(id)) as CoachProspect | null

  if (!prospect) {
    return apiNotFound('Prospect not found')
  }

  // Verify the prospect belongs to this coach
  const coachId = typeof prospect.coach === 'object' ? prospect.coach?.id : prospect.coach
  if (coachId !== auth.coachProfile.id) {
    return apiForbidden('Cannot update another coach\'s prospect')
  }

  const contentType = req.headers.get('content-type') || ''
  let updateData: Record<string, any> = {}
  let profileImageUrl: string | undefined

  if (contentType.includes('multipart/form-data')) {
    // Handle FormData with image upload
    const [formData, formError] = await parseFormData(req)
    if (formError) return formError

    // Handle profile image upload
    profileImageUrl = await handleProfileImageUpload(
      formData,
      prospect.id,
      'prospect',
      prospect.profileImageUrl
    )

    // Extract all profile fields from FormData using shared helper
    updateData = extractProfileDataFromFormData(formData)
  } else {
    // Handle JSON body
    const [body, bodyError] = await parseJsonBody(req)
    if (bodyError) return bodyError

    // Normalize JSON data using shared helper
    updateData = normalizeProfileJsonData(body)
  }

  // Add profile image URL if uploaded
  if (profileImageUrl) {
    updateData.profileImageUrl = profileImageUrl
  }

  const updatedProspect = await updateById('coach-prospects', parseInt(id), updateData)

  return apiSuccess({ prospect: updatedProspect })
})

/**
 * Delete a prospect
 */
export const DELETE = handleApiError(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const [auth, authError] = await withCoach()
  if (authError) return authError

  const prospect = await findById('coach-prospects', parseInt(id))

  if (!prospect) {
    return apiNotFound('Prospect not found')
  }

  // Verify the prospect belongs to this coach
  const coachId = typeof prospect.coach === 'object' ? prospect.coach?.id : prospect.coach
  if (coachId !== auth.coachProfile.id) {
    return apiForbidden('Cannot delete another coach\'s prospect')
  }

  await deleteById('coach-prospects', parseInt(id))

  return apiSuccess({ message: 'Prospect deleted successfully' })
})
