import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { redirect } from 'next/navigation'
import { ProspectForm } from '@/components/ProspectForm'
import { FormPageLayout } from '@/components/ui/FormPageLayout'

export default async function CreateProspectPage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect('/sign-in')
  }

  const role = clerkUser.publicMetadata?.role as string | undefined
  const isCoach = role === 'coach'

  if (!isCoach) {
    return (
      <div className='min-h-svh bg-slate-900 flex items-center justify-center'>
        <p className='text-white'>Only coaches can add prospects.</p>
      </div>
    )
  }

  // Fetch the coach's profile to get the coachId
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const users = await payload.find({
    collection: 'users',
    where: {
      clerkId: {
        equals: clerkUser.id,
      },
    },
  })

  if (users.docs.length === 0) {
    return (
      <div className='min-h-svh bg-slate-900 flex items-center justify-center'>
        <p className='text-white'>User not found. Please contact support.</p>
      </div>
    )
  }

  const payloadUser = users.docs[0]!

  const coaches = await payload.find({
    collection: 'coaches',
    where: {
      user: {
        equals: payloadUser.id,
      },
    },
  })

  if (coaches.docs.length === 0) {
    redirect('/onboarding/coach')
  }

  const coachProfile = coaches.docs[0]!

  return (
    <FormPageLayout
      title='Add New Prospect'
      description='Manually add a prospect to your recruiting board'
      maxWidth='md'
    >
      <ProspectForm coachId={coachProfile.id} />
    </FormPageLayout>
  )
}
