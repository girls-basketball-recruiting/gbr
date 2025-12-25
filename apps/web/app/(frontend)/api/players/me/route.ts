import {
  withAuth,
  apiSuccess,
  handleApiError,
} from '@/lib/api-helpers'
import { findOne } from '@/lib/payload-helpers'

/**
 * Get current user's player profile
 * Returns { player: null } if no profile exists (not a 404)
 */
export const GET = handleApiError(async () => {
  const [auth, authError] = await withAuth()
  if (authError) return authError

  const player = await findOne('players', {
    user: { equals: auth.dbUser.id },
  })

  // Return null player instead of 404 for expected "no profile yet" case
  return apiSuccess({ player: player || null })
})
