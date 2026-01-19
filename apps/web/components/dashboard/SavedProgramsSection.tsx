import { EmptyState } from '@/components/ui/EmptyState'
import { SavedProgramsTable } from './SavedProgramsTable'
import { findAll } from '@/lib/payload-helpers'
import type { College } from '@/payload-types'
import { ButtonLink } from '../ui/ButtonLink'

export async function SavedProgramsSection({ playerId }: { playerId: number }) {
  const savedPrograms = await findAll('player-saved-programs', {
    player: { equals: playerId }
  }, {
    sort: '-savedAt',
    depth: 1 // Populate the college relation
  })

  // Filter out any programs where the college was deleted (college is null)
  const validPrograms = savedPrograms
    .filter(sp => sp.college !== null && typeof sp.college === 'object')
    .map(sp => sp.college as College)

  if (validPrograms.length === 0) {
    return (
      <EmptyState
        title='No Saved Programs Yet'
        description="You haven't saved any college programs yet. Browse all programs to find your perfect fit!"
        action={
          <ButtonLink href='/programs' variant='blue'>
            Browse All Programs
          </ButtonLink>
        }
      />
    )
  }

  return <SavedProgramsTable programs={validPrograms} />
}
