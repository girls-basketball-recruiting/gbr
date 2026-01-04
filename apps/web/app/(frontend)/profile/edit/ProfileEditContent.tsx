import { redirect } from 'next/navigation'
import { PlayerEditForm } from '@/components/PlayerEditForm'
import { CoachEditForm } from '@/components/CoachEditForm'
import { FormPageLayout } from '@/components/ui/FormPageLayout'
import { getAuthContext } from '@/lib/auth-context'
import { getPayload } from 'payload'
import config from '@payload-config'
import { P } from '@/components/ui/typography'

export async function ProfileEditContent() {
  const { clerkUser, dbUser } = await getAuthContext()

  // Get role from Clerk publicMetadata (single source of truth)
  const role = clerkUser.publicMetadata?.role as string | undefined
  const isPlayer = role === 'player'
  const isCoach = role === 'coach'

  if (!isPlayer && !isCoach) {
    return (
      <div className='min-h-svh flex items-center justify-center'>
        <P>User has no roles assigned.</P>
      </div>
    )
  }

  const payload = await getPayload({ config })

  // Fetch player or coach profile
  if (isPlayer) {
    const players = await payload.find({
      collection: 'players',
      where: {
        user: { equals: dbUser.id }
      },
      limit: 1
    })

    const playerProfile = players.docs[0]

    if (!playerProfile) {
      redirect('/onboarding/player')
    }

    return (
      <FormPageLayout
        title='Edit Your Player Profile'
        description='Update your information to stay current with programs'
        maxWidth='lg'
      >
        <PlayerEditForm profile={playerProfile} />
      </FormPageLayout>
    )
  }

  if (isCoach) {
    const coaches = await payload.find({
      collection: 'coaches',
      where: {
        user: { equals: dbUser.id }
      },
      limit: 1
    })

    const coachProfile = coaches.docs[0]

    if (!coachProfile) {
      redirect('/onboarding/coach')
    }

    return (
      <FormPageLayout
        title='Edit Coach Profile'
        description='Keep your information up to date for recruits'
        maxWidth='sm'
      >
        <CoachEditForm profile={coachProfile} />
      </FormPageLayout>
    )
  }

  return null
}
