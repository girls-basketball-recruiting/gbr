import { withPlayer, withCoach, apiSuccess, handleApiError, apiError } from '@/lib/api-helpers'
import { updateById, findById } from '@/lib/payload-helpers'

/**
 * Toggle player or coach attendance for a tournament
 */
export const POST = handleApiError(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: tournamentId } = await params
  const tournamentIdNum = parseInt(tournamentId)

  // Check if tournament is past
  const tournament = await findById('tournaments', tournamentIdNum)
  if (!tournament) {
    return apiError('Tournament not found', 404)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(tournament.endDate)
  endDate.setHours(23, 59, 59, 999)

  if (today > endDate) {
    return apiError('Cannot modify attendance for past tournaments', 400)
  }

  // Try player auth first
  const [playerAuth, playerError] = await withPlayer()
  if (!playerError) {
    // User is a player
    const currentSchedule = playerAuth.playerProfile.tournamentSchedule || []
    const currentScheduleIds = currentSchedule.map(t => typeof t === 'object' ? t.id : t) as number[]
    const isCurrentlyAttending = currentScheduleIds.includes(tournamentIdNum)

    const newScheduleIds = isCurrentlyAttending
      ? currentScheduleIds.filter(id => id !== tournamentIdNum)
      : [...currentScheduleIds, tournamentIdNum]

    await updateById('players', playerAuth.playerProfile.id, {
      tournamentSchedule: newScheduleIds
    })

    return apiSuccess({
      success: true,
      isAttending: !isCurrentlyAttending,
    })
  }

  // Try coach auth
  const [coachAuth, coachError] = await withCoach()
  if (!coachError) {
    // User is a coach
    const currentSchedule = coachAuth.coachProfile.tournamentSchedule || []
    const currentScheduleIds = currentSchedule.map(t => typeof t === 'object' ? t.id : t) as number[]
    const isCurrentlyAttending = currentScheduleIds.includes(tournamentIdNum)

    const newScheduleIds = isCurrentlyAttending
      ? currentScheduleIds.filter(id => id !== tournamentIdNum)
      : [...currentScheduleIds, tournamentIdNum]

    await updateById('coaches', coachAuth.coachProfile.id, {
      tournamentSchedule: newScheduleIds
    })

    return apiSuccess({
      success: true,
      isAttending: !isCurrentlyAttending,
    })
  }

  // Neither player nor coach
  return apiError('Unauthorized: Player or coach role required', 403)
})