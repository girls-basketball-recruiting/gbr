import {
  withCoach,
  parseFormData,
  apiSuccess,
  apiValidationError,
  apiForbidden,
  handleApiError,
} from '@/lib/api-helpers'
import { updateById } from '@/lib/payload-helpers'
import { uploadProfileImage } from '@/lib/blob-storage'

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
  const profileImage = formData.get('profileImage') as File | null

  if (profileImage && profileImage.size > 0 && profileImage.name) {
    profileImageUrl = await uploadProfileImage(
      profileImage,
      auth.dbUser.id,
      'coach',
      auth.coachProfile.profileImageUrl
    )
  }

  // Build update data
  const updateData: any = {}
  if (collegeId !== undefined) updateData.college = collegeId
  if (collegeName) updateData.collegeName = collegeName
  if (jobTitle !== undefined) updateData.jobTitle = jobTitle
  if (email) updateData.email = email
  if (phone !== undefined) updateData.phone = phone
  if (bio !== undefined) updateData.bio = bio
  if (profileImageUrl) updateData.profileImageUrl = profileImageUrl

  // Update the coach profile
  const updatedCoach = await updateById('coaches', parseInt(id), updateData)

  return apiSuccess({ coach: updatedCoach })
})
