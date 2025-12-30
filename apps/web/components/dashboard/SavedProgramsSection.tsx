import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgramCard } from '@/components/ui/ProgramCard'
import { findAll } from '@/lib/payload-helpers'
import type { College } from '@/payload-types'

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
            <Link href='/programs'>
              <Button className='mt-4 bg-blue-600 hover:bg-blue-700 cursor-pointer'>Browse All Programs</Button>
            </Link>
          }
        />
      ) : (
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {validPrograms.map((savedProgram) => {
            const college = typeof savedProgram.college === 'object' ? savedProgram.college : null
            if (!college) return null
            return <ProgramCard key={savedProgram.id} program={college as College} />
          })}
        </div>
      )}
    </>
  )
}
