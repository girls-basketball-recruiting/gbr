'use client'

import { DashboardTable } from '@/components/ui/DashboardTable'
import { PlayerTableRow } from '@/components/ui/PlayerTableRow'
import { SavePlayerButton } from '@/components/SavePlayerButton'
import type { Player } from '@/payload-types'

interface SavedPlayerData {
  id: number
  player: Player
}

interface SavedPlayersTableProps {
  savedPlayers: SavedPlayerData[]
}

export function SavedPlayersTable({ savedPlayers }: SavedPlayersTableProps) {
  return (
    <DashboardTable
      items={savedPlayers}
      pageSize={10}
      emptyState={null}
      renderRow={(savedPlayer) => (
        <PlayerTableRow
          key={savedPlayer.id}
          player={savedPlayer.player}
          action={
            <SavePlayerButton
              playerId={savedPlayer.player.id}
              initialIsSaved
              variant='outline'
              size='sm'
            />
          }
        />
      )}
    />
  )
}
