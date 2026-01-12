import { redirect } from 'next/navigation'
import { CoachProfileView } from '@/components/profile/coach-profile-view'
import { ProfileLayout } from '@/components/profile/profile-layout'
import { PlayerProfileView } from '@/components/profile/player-profile-view'
import { getAuthContext } from '@/lib/auth-context'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Tournament } from '@/payload-types'
import { P } from '@/components/ui/typography'

export async function ProfileView() {
  const { clerkUser, dbUser } = await getAuthContext()

  // Get role from Clerk publicMetadata (single source of truth)
  const role = clerkUser.publicMetadata?.role as string | undefined
  const isPlayer = role === 'player'
  const isCoach = role === 'coach'

  if (!isPlayer && !isCoach) {
    return (
      <div className='p-8'>
        <div className='max-w-3xl mx-auto text-center'>
          <P>No profile found.</P>
        </div>
      </div>
    )
  }

  // Fetch player profile
  if (isPlayer) {
    const payload = await getPayload({ config })

    const players = await payload.find({
      collection: 'players',
      where: {
        user: { equals: dbUser.id }
      },
      depth: 2, // Populate tournamentSchedule relationship
      limit: 1
    })

    const player = players.docs[0]

    if (!player) {
      redirect('/onboarding/player')
    }

    // tournamentSchedule is now populated via PayloadCMS relationship
    // Filter out IDs and keep only populated Tournament objects
    const tournamentSchedule = Array.isArray(player.tournamentSchedule)
      ? player.tournamentSchedule.filter(
          (t): t is Tournament => typeof t === 'object' && t !== null
        )
      : []

    // Render player profile view
    return (
      <ProfileLayout role='player'>
        <PlayerProfileView player={player} tournamentSchedule={tournamentSchedule} />
      </ProfileLayout>
    )
  }

  // Fetch coach profile
  if (isCoach) {
    const payload = await getPayload({ config })

    const coaches = await payload.find({
      collection: 'coaches',
      where: {
        user: { equals: dbUser.id }
      },
      limit: 1
    })

    const coach = coaches.docs[0]

    if (!coach) {
      redirect('/onboarding/coach')
    }

    // Render coach profile view with edit button
    return (
      <ProfileLayout role='coach'>
        <CoachProfileView coach={coach} />
      </ProfileLayout>
    )
  }

  return null
}
