import { EmptyState } from '@/components/ui/EmptyState'
import { ProspectsTable } from './ProspectsTable'
import { findAll } from '@/lib/payload-helpers'
import type { CoachProspect } from '@/payload-types'
import { ProspectsEmptyActions } from './ProspectsEmptyActions'

export async function ProspectsSection({ coachId }: { coachId: number }) {
  const prospects = await findAll('coach-prospects', {
    coach: { equals: coachId }
  }, {
    sort: '-createdAt'
  })

  if (prospects.length === 0) {
    return (
      <EmptyState
        title='No Prospects Added Yet'
        description="Add prospects manually or import from CSV to track players who haven't registered on the platform yet."
        action={<ProspectsEmptyActions />}
      />
    )
  }

  return <ProspectsTable prospects={prospects as CoachProspect[]} />
}
