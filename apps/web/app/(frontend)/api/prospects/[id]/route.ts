import {
  withCoach,
  parseJsonBody,
  parseFormData,
  apiSuccess,
  apiNotFound,
  apiForbidden,
  handleApiError,
} from '@/lib/api-helpers'
import { findById, updateById, deleteById } from '@/lib/payload-helpers'
import { uploadProfileImage } from '@/lib/blob-storage'
import type { CoachProspect } from '@/payload-types'

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
  const coachId = typeof prospect.coach === 'object' ? prospect.coach?.id : prospect.coach
  if (coachId !== auth.coachProfile.id) {
    return apiForbidden('Cannot access another coach\'s prospect')
  }

  return apiSuccess({ prospect })
})

/**
 * Update a prospect
 * Supports both JSON and FormData (for image upload)
 */
export const PUT = handleApiError(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const [auth, authError] = await withCoach()
  if (authError) return authError

  const prospect = await findById('coach-prospects', parseInt(id)) as CoachProspect | null

  if (!prospect) {
    return apiNotFound('Prospect not found')
  }

  // Verify the prospect belongs to this coach
  const coachId = typeof prospect.coach === 'object' ? prospect.coach?.id : prospect.coach
  if (coachId !== auth.coachProfile.id) {
    return apiForbidden('Cannot update another coach\'s prospect')
  }

  const contentType = req.headers.get('content-type') || ''
  let updateData: Record<string, any> = {}
  let profileImageUrl: string | undefined

  if (contentType.includes('multipart/form-data')) {
    // Handle FormData with image upload
    const [formData, formError] = await parseFormData(req)
    if (formError) return formError

    // Handle profile image upload
    const profileImage = formData.get('profileImage')
    if (
      profileImage &&
      profileImage instanceof File &&
      profileImage.size > 0 &&
      profileImage.name
    ) {
      try {
        // Upload new image, delete old one if exists
        profileImageUrl = await uploadProfileImage(
          profileImage,
          prospect.id,
          'prospect',
          prospect.profileImageUrl
        )
      } catch (uploadError) {
        console.error('Error uploading prospect profile image:', uploadError)
      }
    }

    // Parse form data fields
    updateData = parseProspectFormData(formData)
  } else {
    // Handle JSON body
    const [body, bodyError] = await parseJsonBody(req)
    if (bodyError) return bodyError
    updateData = body
  }

  // Add profile image URL if uploaded
  if (profileImageUrl) {
    updateData.profileImageUrl = profileImageUrl
  }

  const updatedProspect = await updateById('coach-prospects', parseInt(id), updateData)

  return apiSuccess({ prospect: updatedProspect })
})

/**
 * Delete a prospect
 */
export const DELETE = handleApiError(async (
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
  const coachId = typeof prospect.coach === 'object' ? prospect.coach?.id : prospect.coach
  if (coachId !== auth.coachProfile.id) {
    return apiForbidden('Cannot delete another coach\'s prospect')
  }

  await deleteById('coach-prospects', parseInt(id))

  return apiSuccess({ message: 'Prospect deleted successfully' })
})

/**
 * Parse FormData into prospect data object
 */
function parseProspectFormData(formData: FormData): Record<string, any> {
  const data: Record<string, any> = {}

  // Required fields
  const firstName = formData.get('firstName')
  const lastName = formData.get('lastName')
  if (firstName) data.firstName = firstName
  if (lastName) data.lastName = lastName

  // Basic Info
  const graduationYear = formData.get('graduationYear')
  if (graduationYear) data.graduationYear = parseInt(graduationYear as string) || undefined

  const city = formData.get('city')
  const state = formData.get('state')
  const highSchool = formData.get('highSchool')
  if (city) data.city = city
  if (state) data.state = state
  if (highSchool) data.highSchool = highSchool

  // Athletic Profile
  const primaryPosition = formData.get('primaryPosition')
  const secondaryPosition = formData.get('secondaryPosition')
  if (primaryPosition) data.primaryPosition = primaryPosition
  if (secondaryPosition) data.secondaryPosition = secondaryPosition

  const heightInInches = formData.get('heightInInches')
  const weight = formData.get('weight')
  if (heightInInches) data.heightInInches = parseInt(heightInInches as string) || undefined
  if (weight) data.weight = parseInt(weight as string) || undefined

  const bio = formData.get('bio')
  if (bio) data.bio = bio

  // AAU Info
  const aauProgramName = formData.get('aauProgramName')
  const aauTeamName = formData.get('aauTeamName')
  const aauCircuit = formData.get('aauCircuit')
  const aauCoach = formData.get('aauCoach')
  if (aauProgramName) data.aauProgramName = aauProgramName
  if (aauTeamName) data.aauTeamName = aauTeamName
  if (aauCircuit) data.aauCircuit = aauCircuit
  if (aauCoach) data.aauCoach = aauCoach

  // Stats
  const ppg = formData.get('ppg')
  const rpg = formData.get('rpg')
  const apg = formData.get('apg')
  if (ppg) data.ppg = parseFloat(ppg as string) || undefined
  if (rpg) data.rpg = parseFloat(rpg as string) || undefined
  if (apg) data.apg = parseFloat(apg as string) || undefined

  // Academic
  const unweightedGpa = formData.get('unweightedGpa')
  const weightedGpa = formData.get('weightedGpa')
  const ncaaId = formData.get('ncaaId')
  if (unweightedGpa) data.unweightedGpa = parseFloat(unweightedGpa as string) || undefined
  if (weightedGpa) data.weightedGpa = parseFloat(weightedGpa as string) || undefined
  if (ncaaId) data.ncaaId = ncaaId

  // Arrays - parse from JSON strings
  const potentialAreasOfStudy = formData.get('potentialAreasOfStudy')
  const desiredLevelsOfPlay = formData.get('desiredLevelsOfPlay')
  const desiredGeographicAreas = formData.get('desiredGeographicAreas')
  const tournamentSchedule = formData.get('tournamentSchedule')
  const awards = formData.get('awards')
  const highlightVideoUrls = formData.get('highlightVideoUrls')

  if (potentialAreasOfStudy) {
    try {
      data.potentialAreasOfStudy = JSON.parse(potentialAreasOfStudy as string)
    } catch {}
  }
  if (desiredLevelsOfPlay) {
    try {
      data.desiredLevelsOfPlay = JSON.parse(desiredLevelsOfPlay as string)
    } catch {}
  }
  if (desiredGeographicAreas) {
    try {
      data.desiredGeographicAreas = JSON.parse(desiredGeographicAreas as string)
    } catch {}
  }
  if (tournamentSchedule) {
    try {
      data.tournamentSchedule = JSON.parse(tournamentSchedule as string)
    } catch {}
  }
  if (awards) {
    try {
      data.awards = JSON.parse(awards as string)
    } catch {}
  }
  if (highlightVideoUrls) {
    try {
      data.highlightVideoUrls = JSON.parse(highlightVideoUrls as string)
    } catch {}
  }

  const desiredDistanceFromHome = formData.get('desiredDistanceFromHome')
  if (desiredDistanceFromHome) data.desiredDistanceFromHome = desiredDistanceFromHome

  // Checkboxes
  const interestedInMilitaryAcademies = formData.get('interestedInMilitaryAcademies')
  const interestedInUltraHighAcademics = formData.get('interestedInUltraHighAcademics')
  const interestedInFaithBased = formData.get('interestedInFaithBased')
  const interestedInAllGirls = formData.get('interestedInAllGirls')
  const interestedInHBCU = formData.get('interestedInHBCU')
  if (interestedInMilitaryAcademies !== null) data.interestedInMilitaryAcademies = interestedInMilitaryAcademies === 'true'
  if (interestedInUltraHighAcademics !== null) data.interestedInUltraHighAcademics = interestedInUltraHighAcademics === 'true'
  if (interestedInFaithBased !== null) data.interestedInFaithBased = interestedInFaithBased === 'true'
  if (interestedInAllGirls !== null) data.interestedInAllGirls = interestedInAllGirls === 'true'
  if (interestedInHBCU !== null) data.interestedInHBCU = interestedInHBCU === 'true'

  // Contact Info
  const phoneNumber = formData.get('phoneNumber')
  const xHandle = formData.get('xHandle')
  const instaHandle = formData.get('instaHandle')
  const tiktokHandle = formData.get('tiktokHandle')
  if (phoneNumber) data.phoneNumber = phoneNumber
  if (xHandle) data.xHandle = xHandle
  if (instaHandle) data.instaHandle = instaHandle
  if (tiktokHandle) data.tiktokHandle = tiktokHandle

  // Coach-specific
  const notes = formData.get('notes')
  if (notes) data.notes = notes

  return data
}
