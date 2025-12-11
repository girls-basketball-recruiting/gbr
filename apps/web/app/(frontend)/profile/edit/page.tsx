import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { redirect } from 'next/navigation'
import { PlayerEditForm } from '@/components/PlayerEditForm'
import { CoachEditForm } from '@/components/CoachEditForm'
import { FormPageLayout } from '@/components/ui/FormPageLayout'

export default async function ProfileEditPage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect('/sign-in')
  }

  // Fetch the user's profile data
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Find the PayloadCMS user
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

  // Get role from PayloadCMS user instead of Clerk metadata
  const role = payloadUser.roles?.[0]
  const isPlayer = role === 'player'
  const isCoach = role === 'coach'

  if (!isPlayer && !isCoach) {
    return (
      <div className='min-h-svh bg-slate-900 flex items-center justify-center'>
        <p className='text-white'>No profile found. Please contact support.</p>
      </div>
    )
  }

  // Fetch player or coach profile
  if (isPlayer) {
    const players = await payload.find({
      collection: 'players',
      where: {
        user: {
          equals: payloadUser.id,
        },
      },
      depth: 1, // Populate profileImage relationship to get URL
    })

    const playerProfile = players.docs[0]

    if (!playerProfile) {
      redirect('/onboarding/player')
    }

    return (
      <FormPageLayout
        title='Edit Your Player Profile'
        description='Update your information to stay current with coaches'
        maxWidth='sm'
      >
        <PlayerEditForm profile={playerProfile} />
      </FormPageLayout>
    )
  }

  if (isCoach) {
    const coaches = await payload.find({
      collection: 'coaches',
      where: {
        user: {
          equals: payloadUser.id,
        },
      },
      depth: 1, // Populate profileImage relationship to get URL
    })

    const coachProfile = coaches.docs[0]

    if (!coachProfile) {
      redirect('/onboarding/coach')
    }

    return (
      <FormPageLayout
        title='Edit Your Coach Profile'
        description='Keep your information up to date for recruits'
        maxWidth='sm'
      >
        <CoachEditForm profile={coachProfile} />
      </FormPageLayout>
    )
  }

  return null
}
