import {
  withCoach,
  apiSuccess,
  apiNotFound,
  handleApiError,
} from '@/lib/api-helpers'
import { findOne, deleteById } from '@/lib/payload-helpers'

/**
 * Unsave a player from coach's saved list
 */
export const DELETE = handleApiError(async (
  _req: Request,
  { params }: { params: Promise<{ playerId: string }> }
) => {
  const { playerId } = await params
  const [auth, authError] = await withCoach()
  if (authError) return authError

  // Find the saved player record
  const savedPlayer = await findOne('coach-saved-players', {
    and: [
      { coach: { equals: auth.coachProfile.id } },
      { player: { equals: parseInt(playerId) } },
    ],
  })

  if (!savedPlayer) {
    return apiNotFound('Saved player not found')
  }

  // Delete the saved player record
  await deleteById('coach-saved-players', savedPlayer.id)

  return apiSuccess({ success: true })
})

/**
 * Check if a player is saved by the current coach
 */
export const GET = handleApiError(async (
  _req: Request,
  { params }: { params: Promise<{ playerId: string }> }
) => {
  const { playerId } = await params
  const [auth, authError] = await withCoach()
  if (authError) return authError

  // Check if player is saved
  const savedPlayer = await findOne('coach-saved-players', {
    and: [
      { coach: { equals: auth.coachProfile.id } },
      { player: { equals: parseInt(playerId) } },
    ],
  })

  return apiSuccess({
    isSaved: !!savedPlayer,
    savedPlayer: savedPlayer || null,
  })
})
