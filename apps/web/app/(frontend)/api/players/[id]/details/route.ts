import {
  withAuth,
  parseFormData,
  apiSuccess,
  apiNotFound,
  apiForbidden,
  handleApiError,
} from '@/lib/api-helpers'
import { findById, updateById } from '@/lib/payload-helpers'
import {
  extractProfileDataFromFormData,
  handleProfileImageUpload,
} from '@/lib/profile-form-helpers'

/**
 * Get player by ID (public)
 */
export const GET = handleApiError(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params

  const player = await findById('players', parseInt(id))
  if (!player) {
    return apiNotFound('Player not found')
  }

  return apiSuccess({ player })
})

/**
 * Update player profile
 */
export const PUT = handleApiError(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const [auth, authError] = await withAuth()
  if (authError) return authError

  // Verify the player belongs to this user
  const player = await findById('players', parseInt(id))
  if (!player) {
    return apiNotFound('Player not found')
  }

  // Handle both populated (User object) and unpopulated (number) user field
  const playerUserId = typeof player.user === 'number' ? player.user : player.user.id
  if (playerUserId !== auth.dbUser.id) {
    return apiForbidden('Unauthorized to edit this profile')
  }

  const [formData, formError] = await parseFormData(req)
  if (formError) return formError

  // Handle profile image upload if provided
  const profileImageUrl = await handleProfileImageUpload(
    formData,
    auth.dbUser.id,
    'player',
    player.profileImageUrl
  )

  // Extract all profile fields from FormData using shared helper
  const updateData = extractProfileDataFromFormData(formData)

  // Add profile image URL if uploaded
  if (profileImageUrl) {
    updateData.profileImageUrl = profileImageUrl
  }

  // Update the player profile
  const updated = await updateById('players', parseInt(id), updateData)

  return apiSuccess({ player: updated })
})
