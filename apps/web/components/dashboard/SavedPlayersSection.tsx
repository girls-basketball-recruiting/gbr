import { EmptyState } from '@/components/ui/EmptyState'
import { SavedPlayersTable } from './SavedPlayersTable'
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

  // Filter out any players that were deleted (player is null) and transform data
  const validPlayers = savedPlayers
    .filter(sp => sp.player !== null && typeof sp.player === 'object')
    .map(sp => ({
      id: sp.id,
      player: sp.player as Player
    }))

  if (validPlayers.length === 0) {
    return (
      <EmptyState
        title='No Saved Players Yet'
        description="You haven't saved any players yet. Browse all players to find recruits and save them to your board!"
        action={
          <ButtonLink href='/players' variant='secondary'>
            Browse All Players
          </ButtonLink>
        }
      />
    )
  }

  return <SavedPlayersTable savedPlayers={validPlayers} />
}
