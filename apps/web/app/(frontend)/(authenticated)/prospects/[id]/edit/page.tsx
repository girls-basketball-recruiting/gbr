import { notFound, redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { ProspectForm } from '@/components/ProspectForm'
import { findById, findOne } from '@/lib/payload-helpers'
import type { CoachProspect } from '@/payload-types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { H1 } from '@/components/ui/typography'

export default async function EditProspectPage({
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

  return (
    <div className='px-8'>
      <div className='max-w-xl mx-auto space-y-6'>
        <H1>Edit Prospect</H1>

        <ProspectForm
          coachId={coachProfile.id}
          prospect={prospect}
          mode='edit'
        />
      </div>
    </div>
  )
}
