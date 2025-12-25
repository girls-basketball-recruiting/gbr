import {
  withCoach,
  parseJsonBody,
  apiSuccess,
  apiValidationError,
  handleApiError,
} from '@/lib/api-helpers'
import { findWithRelations, create, exists } from '@/lib/payload-helpers'

/**
 * Save a player to coach's saved list
 */
export const POST = handleApiError(async (req: Request) => {
  // Auth handled automatically - coachProfile is guaranteed to exist
  const [auth, authError] = await withCoach()
  if (authError) return authError

  // Parse body with automatic error handling
  const [body, bodyError] = await parseJsonBody<{ playerId: number }>(req)
  if (bodyError) return bodyError

  const { playerId } = body
  if (!playerId) {
    return apiValidationError('playerId is required')
  }

  // Check if already saved
  const alreadySaved = await exists('coach-saved-players', {
    and: [
      { coach: { equals: auth.coachProfile.id } },
      { player: { equals: playerId } },
    ],
  })

  if (alreadySaved) {
    return apiValidationError('Player already saved')
  }

  // Create saved player record
  const savedPlayer = await create('coach-saved-players', {
    coach: auth.coachProfile.id,
    player: playerId,
    savedAt: new Date().toISOString(),
  })

  return apiSuccess({ savedPlayer }, 201)
})

/**
 * Get all saved players for the current coach
 */
export const GET = handleApiError(async () => {
  const [auth, authError] = await withCoach()
  if (authError) return authError

  // Find all saved players with populated player data
  const savedPlayers = await findWithRelations(
    'coach-saved-players',
    { coach: { equals: auth.coachProfile.id } },
    { depth: 1, sort: '-savedAt' }
  )

  return apiSuccess({ savedPlayers })
})
