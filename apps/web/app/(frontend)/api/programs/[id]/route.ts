import { apiSuccess, apiNotFound, handleApiError } from '@/lib/api-helpers'
import { findById, findAll } from '@/lib/payload-helpers'

/**
 * Get a specific college program by ID with coaches
 */
export const GET = handleApiError(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const collegeId = parseInt(id)

  // Fetch the college
  const college = await findById('colleges', collegeId)

  if (!college) {
    return apiNotFound('Program not found')
  }

  // Find coaches for this college
  const coaches = await findAll('coaches', {
    college: { equals: collegeId },
  })

  return apiSuccess({
    program: college,
    coaches,
  })
})
