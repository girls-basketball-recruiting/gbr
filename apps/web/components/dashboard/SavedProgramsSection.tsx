import { EmptyState } from '@/components/ui/EmptyState'
import { ProgramCard } from '@/components/ui/ProgramCard'
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
  const validPrograms = savedPrograms.filter(sp => sp.college !== null)

  return (
    <>
      {validPrograms.length === 0 ? (
        <EmptyState
          title='No Saved Programs Yet'
          description="You haven't saved any college programs yet. Browse all programs to find your perfect fit!"
          action={
            <ButtonLink href='/programs' variant='blue'>
              Browse All Programs
            </ButtonLink>
          }
        />
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {validPrograms.map((savedProgram) => (
            <ProgramCard key={savedProgram.id} program={savedProgram.college as College} isSaved />
          ))}
        </div>
      )}
    </>
  )
}
