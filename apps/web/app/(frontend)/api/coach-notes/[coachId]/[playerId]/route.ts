import {
  withCoach,
  parseJsonBody,
  apiSuccess,
  apiForbidden,
  handleApiError,
} from '@/lib/api-helpers'
import { findOne, create, updateById } from '@/lib/payload-helpers'

/**
 * Get coach notes for a specific player
 */
export const GET = handleApiError(async (
  _req: Request,
  { params }: { params: Promise<{ coachId: string; playerId: string }> }
) => {
  const { coachId, playerId } = await params
  const [auth, authError] = await withCoach()
  if (authError) return authError

  // Verify the coach is accessing their own notes
  if (auth.coachProfile.id !== parseInt(coachId)) {
    return apiForbidden('Cannot access another coach\'s notes')
  }

  // Find existing notes
  const note = await findOne('coach-player-notes', {
    and: [
      { coach: { equals: parseInt(coachId) } },
      { player: { equals: parseInt(playerId) } },
    ],
  })

  // Return empty notes if none exist
  if (!note) {
    return apiSuccess({
      notes: '',
      contactRecords: [],
    })
  }

  return apiSuccess(note)
})

/**
 * Create or update coach notes for a specific player
 */
export const PUT = handleApiError(async (
  req: Request,
  { params }: { params: Promise<{ coachId: string; playerId: string }> }
) => {
  const { coachId, playerId } = await params
  const [auth, authError] = await withCoach()
  if (authError) return authError

  // Verify the coach is updating their own notes
  if (auth.coachProfile.id !== parseInt(coachId)) {
    return apiForbidden('Cannot update another coach\'s notes')
  }

  const [body, bodyError] = await parseJsonBody<{
    notes: string
    contactRecords?: Array<{
      date?: string
      followUpDate?: string
      // [key: string]: any
    }>
    interestLevel?: string
  }>(req)
  if (bodyError) return bodyError

  // Sanitize contact records - convert empty strings to undefined for date fields
  const sanitizedContactRecords = (body.contactRecords || []).map(
    (record) => ({
      ...record,
      date: record.date === '' ? undefined : record.date,
      followUpDate:
        record.followUpDate === '' ? undefined : record.followUpDate,
    }),
  )

  // Find existing notes
  const existingNote = await findOne('coach-player-notes', {
    and: [
      { coach: { equals: parseInt(coachId) } },
      { player: { equals: parseInt(playerId) } },
    ],
  })

  let result

  if (!existingNote) {
    // Create new notes
    result = await create('coach-player-notes', {
      coach: parseInt(coachId),
      player: parseInt(playerId),
      notes: body.notes || '',
      contactRecords: sanitizedContactRecords,
      interestLevel: body.interestLevel,
    })
  } else {
    // Update existing notes
    result = await updateById('coach-player-notes', existingNote.id, {
      notes: body.notes,
      contactRecords: sanitizedContactRecords,
      interestLevel: body.interestLevel,
    })
  }

  return apiSuccess(result)
})
