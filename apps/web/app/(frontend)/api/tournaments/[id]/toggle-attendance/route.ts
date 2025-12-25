import { withPlayer, apiSuccess, handleApiError } from '@/lib/api-helpers'
import { updateById } from '@/lib/payload-helpers'

/**
 * Toggle player attendance for a tournament
 */
export const POST = handleApiError(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: tournamentId } = await params
  const [auth, authError] = await withPlayer()
  if (authError) return authError

  const tournamentIdNum = parseInt(tournamentId)
  
  // Get current schedule IDs
  // Payload returns relations as objects or IDs depending on depth. 
  // auth.playerProfile comes from findById with default depth, so it likely has objects if populated.
  // However, requirePlayer uses findOne which might have depth. 
  // Safest is to map to IDs.
  
  const currentSchedule = auth.playerProfile.tournamentSchedule || []
  const currentScheduleIds = currentSchedule.map(t => typeof t === 'object' ? t.id : t) as number[]

  const isCurrentlyAttending = currentScheduleIds.includes(tournamentIdNum)
  
  let newScheduleIds: number[]
  if (isCurrentlyAttending) {
    // Remove
    newScheduleIds = currentScheduleIds.filter(id => id !== tournamentIdNum)
  } else {
    // Add
    newScheduleIds = [...currentScheduleIds, tournamentIdNum]
  }

  // Update player profile
  await updateById('players', auth.playerProfile.id, {
    tournamentSchedule: newScheduleIds
  })

  return apiSuccess({
    success: true,
    isAttending: !isCurrentlyAttending,
  })
})