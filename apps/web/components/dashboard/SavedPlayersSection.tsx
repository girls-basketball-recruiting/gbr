import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlayerCard } from '@/components/ui/PlayerCard'
import { findAll } from '@/lib/payload-helpers'
import type { Player } from '@/payload-types'

export async function SavedPlayersSection({ coachId }: { coachId: number }) {
  const savedPlayers = await findAll('coach-saved-players', {
    coach: { equals: coachId }
  }, {
    sort: '-savedAt',
    depth: 1 // Populate the player relation
  })

  // Filter out any players that were deleted (player is null)
  const validPlayers = savedPlayers.filter(sp => sp.player !== null)

  return (
    <>
      {validPlayers.length === 0 ? (
        <EmptyState
          title='No Saved Players Yet'
          description="You haven't saved any players yet. Browse all players to find recruits and save them to your board!"
          action={
            <Link href='/players'>
              <Button className='mt-4 bg-blue-600 hover:bg-blue-700 cursor-pointer'>Browse All Players</Button>
            </Link>
          }
        />
      ) : (
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {validPlayers.map((savedPlayer) => {
            const player = typeof savedPlayer.player === 'object' ? savedPlayer.player : null
            if (!player) return null
            return <PlayerCard key={savedPlayer.id} player={player as Player} />
          })}
        </div>
      )}
    </>
  )
}
