import { EmptyState } from '@/components/ui/EmptyState'
import { ProfileCard } from '@/components/ui/ProfileCard'
import { findAll } from '@/lib/payload-helpers'
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
            <ProfileCard
              key={prospect.id}
              profile={prospect}
              variant='prospect'
            />
          ))}
        </div>
      )}
    </>
  )
}
