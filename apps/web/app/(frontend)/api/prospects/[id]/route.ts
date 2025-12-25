import {
  withCoach,
  apiSuccess,
  apiNotFound,
  apiForbidden,
  handleApiError,
} from '@/lib/api-helpers'
import { findById } from '@/lib/payload-helpers'

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
  if (prospect.coach !== auth.coachProfile.id) {
    return apiForbidden('Cannot access another coach\'s prospect')
  }

  return apiSuccess({ prospect })
})
