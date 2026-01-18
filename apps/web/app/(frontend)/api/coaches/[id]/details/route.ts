import {
  withCoach,
  parseFormData,
  apiSuccess,
  apiValidationError,
  apiForbidden,
  apiNotFound,
  handleApiError,
} from '@/lib/api-helpers'
import { findById, updateById } from '@/lib/payload-helpers'
import { uploadProfileImage } from '@/lib/blob-storage'

/**
 * Get coach by ID (public)
 */
export const GET = handleApiError(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params

  const coach = await findById('coaches', parseInt(id))
  if (!coach) {
    return apiNotFound('Coach not found')
  }

  return apiSuccess({ coach })
})

/**
 * Update coach profile
 */
export const PUT = handleApiError(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const [auth, authError] = await withCoach()
  if (authError) return authError

  // Verify the coach profile belongs to this user
  if (auth.coachProfile.id !== parseInt(id)) {
    return apiForbidden('Unauthorized to edit this profile')
  }

  const [formData, formError] = await parseFormData(req)
  if (formError) return formError

  // Extract fields from FormData
  const collegeId = formData.get('collegeId') ? parseInt(formData.get('collegeId') as string) : undefined
  const collegeName = formData.get('collegeName') as string | undefined
  const city = formData.get('city') as string | undefined
  const state = formData.get('state') as string | undefined
  const jobTitle = formData.get('jobTitle') as string | undefined
  const email = formData.get('email') as string | undefined
  const phone = formData.get('phone') as string | undefined
  const bio = formData.get('bio') as string | undefined

  // Validate required fields
  if (collegeId && collegeId === 0) {
    return apiValidationError('College selection is required')
  }

  // Handle profile image upload if provided
  let profileImageUrl: string | undefined
  const profileImageFile = formData.get('profileImageUrl') as File | null

  if (profileImageFile && profileImageFile.size > 0 && profileImageFile.name) {
    profileImageUrl = await uploadProfileImage(
      profileImageFile,
      auth.dbUser.id,
      'coach',
      auth.coachProfile.profileImageUrl
    )
  }

  // Build update data
  const updateData: any = {}
  if (collegeId !== undefined) updateData.collegeId = collegeId
  if (collegeName) updateData.collegeName = collegeName
  if (city) updateData.city = city
  if (state) updateData.state = state
  if (jobTitle !== undefined) updateData.jobTitle = jobTitle
  if (email) updateData.email = email
  if (phone !== undefined) updateData.phone = phone
  if (bio !== undefined) updateData.bio = bio
  if (profileImageUrl) updateData.profileImageUrl = profileImageUrl

  // Update the coach profile
  const updatedCoach = await updateById('coaches', parseInt(id), updateData)

  return apiSuccess({ coach: updatedCoach })
})
