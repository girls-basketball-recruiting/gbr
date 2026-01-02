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

  // Handle both populated (User object) and unpopulated (number) user field
  const playerUserId = typeof player.user === 'number' ? player.user : player.user.id
  if (playerUserId !== auth.dbUser.id) {
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
  const highlightVideos = parseJsonField('highlightVideoUrls')
  let parsedHighlightVideoUrls: Array<{ url: string; id?: string }> | undefined
  if (highlightVideos && Array.isArray(highlightVideos)) {
    parsedHighlightVideoUrls = highlightVideos
      .filter((vid: { url: string }) => vid.url.trim())
      .map((vid: { url: string }) => ({ url: vid.url.trim() }))
  }

  // Parse other JSON fields
  const desiredLevelsOfPlay = parseJsonField('desiredLevelsOfPlay')
  const desiredGeographicAreas = parseJsonField('desiredGeographicAreas')
  const potentialAreasOfStudy = parseJsonField('potentialAreasOfStudy')
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
    'desiredDistanceFromHome',
    'aauProgramName',
    'aauTeamName',
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

  // Boolean fields (checkboxes)
  const booleanFields = [
    'interestedInMilitaryAcademies',
    'interestedInUltraHighAcademics',
    'interestedInFaithBased',
    'interestedInAllGirls',
    'interestedInHBCU',
  ]
  booleanFields.forEach((field) => {
    const value = formData.get(field)
    if (value !== null && value !== undefined) {
      // Convert string 'true'/'false' to boolean
      updateData[field] = value === 'true'
    }
  })

  // JSON fields
  if (awards) updateData.awards = awards
  if (desiredLevelsOfPlay) updateData.desiredLevelsOfPlay = desiredLevelsOfPlay
  if (desiredGeographicAreas) updateData.desiredGeographicAreas = desiredGeographicAreas
  if (potentialAreasOfStudy) updateData.potentialAreasOfStudy = potentialAreasOfStudy
  if (parsedHighlightVideoUrls) updateData.highlightVideoUrls = parsedHighlightVideoUrls
  if (profileImageUrl) updateData.profileImageUrl = profileImageUrl

  // Update the player profile
  const updated = await updateById('players', parseInt(id), updateData)

  return apiSuccess({ player: updated })
})
