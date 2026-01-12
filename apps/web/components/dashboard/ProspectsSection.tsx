import { EmptyState } from '@/components/ui/EmptyState'
import { ProspectCard } from '@/components/ui/ProspectCard'
import { findAll } from '@/lib/payload-helpers'
import { ButtonLink } from '../ui/ButtonLink'
import { ProspectsEmptyActions } from './ProspectsEmptyActions'

export async function ProspectsSection({ coachId }: { coachId: number }) {
  const prospects = await findAll('coach-prospects', {
    coach: { equals: coachId }
  }, {
    sort: '-createdAt'
  })

  return (
    <>
      {prospects.length === 0 ? (
        <EmptyState
          title='No Prospects Added Yet'
          description="Add prospects manually or import from CSV to track players who haven't registered on the platform yet."
          action={<ProspectsEmptyActions />}
        />
      ) : (
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {prospects.map((prospect: any) => (
            <ProspectCard key={prospect.id} prospect={prospect} />
          ))}
        </div>
      )}
    </>
  )
}
