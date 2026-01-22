import { notFound, redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { ProfileView } from '@/components/profile/ProfileView'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { findById, findOne } from '@/lib/payload-helpers'
import type { Tournament, CoachProspect } from '@/payload-types'
import { Pencil } from 'lucide-react'

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect('/sign-in')
  }

  // Find the user and verify they're a coach
  const user = await findOne('users', { clerkId: { equals: clerkUser.id } })

  if (!user || !user.roles?.includes('coach')) {
    redirect('/')
  }

  // Find the coach profile
  const coachProfile = await findOne('coaches', { user: { equals: user.id } })

  if (!coachProfile) {
    redirect('/')
  }

  // Fetch the prospect
  const prospect = await findById('coach-prospects', parseInt(id)) as CoachProspect | null

  if (!prospect) {
    notFound()
  }

  // Verify the prospect belongs to this coach
  const prospectCoachId = typeof prospect.coach === 'object' ? prospect.coach?.id : prospect.coach
  if (prospectCoachId !== coachProfile.id) {
    notFound()
  }

  // Get tournament schedule from prospect object (populated by Payload)
  // Note: typeof null === 'object' in JS, so we must also check truthiness
  const tournamentSchedule = (prospect.tournamentSchedule as unknown as Tournament[])?.filter(t => t && typeof t === 'object') || []

  return (
    <div>
      <div className='max-w-6xl mx-auto space-y-8 px-5'>

        {/* Prospect Profile View */}
        <ProfileView
          profile={prospect}
          variant='prospect'
          tournamentSchedule={tournamentSchedule}
          coachId={coachProfile.id.toString()}
          canViewContact={true}
          headerAction={
            <ButtonLink
              href={`/prospects/${prospect.id}/edit`}
              variant='outline'
              size='sm'
            >
              <Pencil className='w-4 h-4 mr-1.5' />
              Edit
            </ButtonLink>
          }
        />
      </div>
    </div>
  )
}
