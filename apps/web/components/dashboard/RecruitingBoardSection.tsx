import { getPayloadClient } from '@/lib/payload-helpers'
import { RecruitingBoard } from './RecruitingBoard'
import type { Player, CoachProspect, Coach } from '@/payload-types'

export type BoardOrderItem = {
  type: 'prospect' | 'player'
  id: number
}

export type BoardItem = {
  type: 'prospect' | 'player'
  id: number
  data: Player | CoachProspect
}

interface RecruitingBoardSectionProps {
  coachId: number
}

export async function RecruitingBoardSection({ coachId }: RecruitingBoardSectionProps) {
  const payload = await getPayloadClient()

  // Fetch the coach to get boardOrder
  const coach = await payload.findByID({
    collection: 'coaches',
    id: coachId,
  }) as Coach

  const boardOrder = (coach.boardOrder as BoardOrderItem[]) || []

  // Fetch all saved players for this coach
  const savedPlayersResult = await payload.find({
    collection: 'coach-saved-players',
    where: {
      coach: { equals: coachId },
    },
    limit: 1000,
    depth: 1,
  })

  // Fetch all prospects for this coach
  const prospectsResult = await payload.find({
    collection: 'coach-prospects',
    where: {
      coach: { equals: coachId },
    },
    limit: 1000,
  })

  // Create maps for quick lookup
  const playerMap = new Map<number, Player>()
  for (const savedPlayer of savedPlayersResult.docs) {
    if (savedPlayer.player && typeof savedPlayer.player !== 'number') {
      // Filter out deleted players
      if (!savedPlayer.player.deletedAt) {
        playerMap.set(savedPlayer.player.id, savedPlayer.player)
      }
    }
  }

  const prospectMap = new Map<number, CoachProspect>()
  for (const prospect of prospectsResult.docs) {
    prospectMap.set(prospect.id, prospect)
  }

  // Build the ordered items list based on boardOrder
  const orderedItems: BoardItem[] = []
  const seenItems = new Set<string>()

  for (const orderItem of boardOrder) {
    const key = `${orderItem.type}-${orderItem.id}`
    if (seenItems.has(key)) continue
    seenItems.add(key)

    if (orderItem.type === 'player') {
      const player = playerMap.get(orderItem.id)
      if (player) {
        orderedItems.push({ type: 'player', id: orderItem.id, data: player })
      }
    } else if (orderItem.type === 'prospect') {
      const prospect = prospectMap.get(orderItem.id)
      if (prospect) {
        orderedItems.push({ type: 'prospect', id: orderItem.id, data: prospect })
      }
    }
  }

  // Add any items not in boardOrder to the end (migration handling)
  // This handles existing data that doesn't have boardOrder populated
  const itemsToAppend: BoardItem[] = []

  for (const [id, player] of playerMap) {
    const key = `player-${id}`
    if (!seenItems.has(key)) {
      itemsToAppend.push({ type: 'player', id, data: player })
      seenItems.add(key)
    }
  }

  for (const [id, prospect] of prospectMap) {
    const key = `prospect-${id}`
    if (!seenItems.has(key)) {
      itemsToAppend.push({ type: 'prospect', id, data: prospect })
      seenItems.add(key)
    }
  }

  // Sort new items by creation date (newest last, to append at end)
  itemsToAppend.sort((a, b) => {
    const aDate = new Date(a.data.createdAt).getTime()
    const bDate = new Date(b.data.createdAt).getTime()
    return aDate - bDate
  })

  const allItems = [...orderedItems, ...itemsToAppend]

  // If there were items not in boardOrder, we should update the boardOrder
  // This is handled by the client component on first render if needed
  const needsOrderSync = itemsToAppend.length > 0

  return (
    <RecruitingBoard
      initialItems={allItems}
      needsOrderSync={needsOrderSync}
    />
  )
}
