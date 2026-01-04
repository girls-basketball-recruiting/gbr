'use client'

import { ListPageToolbar } from './ListPageToolbar'
import { SortByDropdown } from './SortByDropdown'
import { PlayerCard } from './ui/PlayerCard'
import { PlayersTable } from './PlayersTable'
import { SavePlayerButton } from './SavePlayerButton'
import { EmptyState } from './ui/EmptyState'
import { URLPagination } from './URLPagination'
import { useViewPreference } from '@/hooks/useViewPreference'

interface PlayersPageContentProps {
  players: any[]
  totalDocs: number
  totalPages: number
  currentPage: number
  savedPlayerIds: number[]
  isCoach: boolean
  currentPlayerId?: number
}

export function PlayersPageContent({
  players,
  totalDocs,
  totalPages,
  currentPage,
  savedPlayerIds,
  isCoach,
  currentPlayerId,
}: PlayersPageContentProps) {
  const { view, handleViewChange } = useViewPreference('players', 'grid')

  return (
    <>
      {/* Toolbar */}
      <ListPageToolbar
        totalCount={totalDocs}
        itemLabel='player'
        view={view}
        onViewChange={handleViewChange}
        sortSelector={<SortByDropdown />}
      />

      {/* Content */}
      {players.length === 0 ? (
        <EmptyState
          title='No Players Found'
          description='No players match your current filters. Try adjusting your search criteria.'
        />
      ) : view === 'table' ? (
        <PlayersTable
          players={players}
          savedPlayerIds={savedPlayerIds}
          isCoach={isCoach}
          currentPlayerId={currentPlayerId}
        />
      ) : (
        <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-6'>
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              isOwnCard={currentPlayerId === player.id}
              action={
                isCoach ? (
                  <SavePlayerButton
                    playerId={player.id}
                    initialIsSaved={savedPlayerIds.includes(player.id)}
                    variant='outline'
                    className='border-slate-600 text-white hover:bg-slate-800'
                  />
                ) : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='mt-8'>
          <URLPagination
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </>
  )
}
