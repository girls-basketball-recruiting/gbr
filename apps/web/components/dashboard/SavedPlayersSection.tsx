import { EmptyState } from '@/components/ui/EmptyState'
import { ProfileCard } from '@/components/ui/ProfileCard'
import { findAll } from '@/lib/payload-helpers'
import type { Player } from '@/payload-types'
import { ButtonLink } from '../ui/ButtonLink'

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
            <ButtonLink href='/players' variant='secondary'>
              Browse All Players
            </ButtonLink>
          }
        />
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {validPlayers.map((savedPlayer) => {
            const player = typeof savedPlayer.player === 'object' ? savedPlayer.player : null
            if (!player) return null
            return (
              <ProfileCard
                key={savedPlayer.id}
                profile={player as Player}
                variant='player'
              />
            )
          })}
        </div>
      )}
    </>
  )
}
