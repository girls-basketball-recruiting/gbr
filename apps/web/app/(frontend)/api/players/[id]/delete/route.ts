import {
  withAuth,
  apiSuccess,
  apiNotFound,
  apiForbidden,
  handleApiError,
} from '@/lib/api-helpers'
import { findById, updateById } from '@/lib/payload-helpers'
import { deleteProfileImage } from '@/lib/blob-storage'

/**
 * Soft delete player profile
 */
export const POST = handleApiError(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const [auth, authError] = await withAuth()
  if (authError) return authError

  // Verify the player profile belongs to this user
  const playerProfile = await findById('players', parseInt(id))

  if (!playerProfile) {
    return apiNotFound('Player profile not found')
  }

  if (playerProfile.user !== auth.dbUser.id) {
    return apiForbidden('Unauthorized to delete this profile')
  }

  // Delete profile image from Vercel Blob if it exists
  if (playerProfile.profileImageUrl) {
    await deleteProfileImage(playerProfile.profileImageUrl)
  }

  // Soft delete: set deletedAt timestamp
  await updateById('players', parseInt(id), {
    deletedAt: new Date().toISOString(),
  })

  return apiSuccess({ success: true, deleted: true })
})
