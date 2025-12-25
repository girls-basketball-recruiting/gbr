import {
  withCoach,
  parseJsonBody,
  apiSuccess,
  handleApiError,
} from '@/lib/api-helpers'
import { findAll, create } from '@/lib/payload-helpers'

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
 */
export const POST = handleApiError(async (req: Request) => {
  const [auth, authError] = await withCoach()
  if (authError) return authError

  const [body, bodyError] = await parseJsonBody(req)
  if (bodyError) return bodyError

  const prospect = await create('coach-prospects', {
    ...body,
    coach: auth.coachProfile.id,
  })

  return apiSuccess({ prospect }, 201)
})
