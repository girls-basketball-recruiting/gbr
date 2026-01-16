import {
  withCoach,
  parseJsonBody,
  parseFormData,
  apiSuccess,
  handleApiError,
} from '@/lib/api-helpers'
import { findAll, create } from '@/lib/payload-helpers'
import { uploadProfileImage } from '@/lib/blob-storage'

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
 * Supports both JSON and FormData (for image upload)
 */
export const POST = handleApiError(async (req: Request) => {
  const [auth, authError] = await withCoach()
  if (authError) return authError

  const contentType = req.headers.get('content-type') || ''
  let prospectData: Record<string, any> = {}
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
        // Generate a temporary ID for the prospect image folder
        const tempId = `new-${Date.now()}`
        profileImageUrl = await uploadProfileImage(
          profileImage,
          tempId,
          'prospect'
        )
      } catch (uploadError) {
        console.error('Error uploading prospect profile image:', uploadError)
      }
    }

    // Parse form data fields
    prospectData = parseProspectFormData(formData)
  } else {
    // Handle JSON body
    const [body, bodyError] = await parseJsonBody(req)
    if (bodyError) return bodyError
    prospectData = body
  }

  // Add coach reference and profile image URL
  const createData = {
    ...prospectData,
    coach: auth.coachProfile.id,
    ...(profileImageUrl && { profileImageUrl }),
  }

  const prospect = await create('coach-prospects', createData)

  return apiSuccess({ prospect }, 201)
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
  data.interestedInMilitaryAcademies = interestedInMilitaryAcademies === 'true'
  data.interestedInUltraHighAcademics = interestedInUltraHighAcademics === 'true'
  data.interestedInFaithBased = interestedInFaithBased === 'true'
  data.interestedInAllGirls = interestedInAllGirls === 'true'
  data.interestedInHBCU = interestedInHBCU === 'true'

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
