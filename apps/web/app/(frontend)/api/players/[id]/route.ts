import {
  withAuth,
  parseFormData,
  apiSuccess,
  apiNotFound,
  apiForbidden,
  handleApiError,
} from '@/lib/api-helpers'
import { findById, updateById } from '@/lib/payload-helpers'
import { uploadProfileImage } from '@/lib/blob-storage'

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

  if (player.user !== auth.dbUser.id) {
    return apiForbidden('Unauthorized to edit this profile')
  }

  const [formData, formError] = await parseFormData(req)
  if (formError) return formError

  // Handle profile image upload if provided
  let profileImageUrl: string | undefined
  const profileImage = formData.get('profileImage') as File | null

  if (profileImage && profileImage.size > 0 && profileImage.name) {
    profileImageUrl = await uploadProfileImage(
      profileImage,
      auth.dbUser.id,
      'player',
      player.profileImageUrl
    )
  }

  // Helper to parse JSON fields from FormData
  const parseJsonField = (fieldName: string) => {
    const value = formData.get(fieldName)
    if (!value) return undefined
    try {
      return JSON.parse(value as string)
    } catch {
      return undefined
    }
  }

  // Parse highlight video URLs
  const highlightVideoUrls = parseJsonField('highlightVideoUrls')
  let parsedHighlightVideoUrls: Array<{ url: string; id?: string }> | undefined
  if (highlightVideoUrls && Array.isArray(highlightVideoUrls)) {
    parsedHighlightVideoUrls = highlightVideoUrls
      .filter((url: string) => url.trim())
      .map((url: string) => ({ url: url.trim() }))
  }

  // Parse other JSON fields
  const desiredLevelsOfPlay = parseJsonField('desiredLevelsOfPlay')
  const desiredGeographicAreas = parseJsonField('desiredGeographicAreas')
  const awards = parseJsonField('awards')

  // Build update data
  const updateData: any = {}

  // Basic text fields
  const textFields = [
    'firstName',
    'lastName',
    'graduationYear',
    'highSchool',
    'city',
    'state',
    'primaryPosition',
    'secondaryPosition',
    'phoneNumber',
    'email',
    'xHandle',
    'instaHandle',
    'tiktokHandle',
    'ncaaId',
    'bio',
    'distanceFromHome',
    'aauProgram',
    'aauTeam',
    'aauCircuit',
    'aauCoach',
  ]

  textFields.forEach((field) => {
    const value = formData.get(field)
    if (value) updateData[field] = value as string
  })

  // Number fields
  const numberFields = ['heightInInches', 'weight', 'ppg', 'rpg', 'apg']
  numberFields.forEach((field) => {
    const value = formData.get(field)
    if (value) updateData[field] = field.includes('Gpa')
      ? parseFloat(value as string)
      : parseInt(value as string)
  })

  // GPA fields (float)
  const gpaFields = ['unweightedGpa', 'weightedGpa']
  gpaFields.forEach((field) => {
    const value = formData.get(field)
    if (value) updateData[field] = parseFloat(value as string)
  })

  // JSON fields
  if (awards) updateData.awards = awards
  if (desiredLevelsOfPlay) updateData.desiredLevelsOfPlay = desiredLevelsOfPlay
  if (desiredGeographicAreas) updateData.geographicAreas = desiredGeographicAreas
  if (parsedHighlightVideoUrls) updateData.highlightVideoUrls = parsedHighlightVideoUrls
  if (profileImageUrl) updateData.profileImageUrl = profileImageUrl

  // Update the player profile
  const updated = await updateById('players', parseInt(id), updateData)

  return apiSuccess({ player: updated })
})
