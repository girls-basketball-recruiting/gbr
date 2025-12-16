'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ListPageToolbar } from './ListPageToolbar'
import { SortByDropdown } from './SortByDropdown'
import { PlayerCard } from './ui/PlayerCard'
import { PlayersTable } from './PlayersTable'
import { SavePlayerButton } from './SavePlayerButton'
import { EmptyState } from './ui/EmptyState'
import { Pagination } from './Pagination'

interface PlayersPageContentProps {
  players: any[]
  totalDocs: number
  totalPages: number
  currentPage: number
  savedPlayerIds: number[]
  isCoach: boolean
  initialView?: 'grid' | 'table'
}

export function PlayersPageContent({
  players,
  totalDocs,
  totalPages,
  currentPage,
  savedPlayerIds,
  isCoach,
  initialView = 'grid',
}: PlayersPageContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = (searchParams.get('view') as 'grid' | 'table') || initialView

  const handleViewChange = (newView: 'grid' | 'table') => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', newView)
    router.push(`/players?${params.toString()}`)
  }

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
        />
      ) : (
        <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-6'>
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </>
  )
}
