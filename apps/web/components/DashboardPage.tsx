import { currentUser } from '@clerk/nextjs/server'
import PlayerDashboard from './PlayerDashboard'
import CoachDashboard from './CoachDashboard'
import { SidebarLayout } from './sidebar-layout'
import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function DashboardPage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return (
      <div className='min-h-svh flex items-center justify-center bg-slate-900'>
        <p className='text-white'>Loading...</p>
      </div>
    )
  }

  // Get role from PayloadCMS user instead of Clerk metadata
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

  const payloadUser = users.docs[0]
  const role = payloadUser?.roles?.[0]
  const isPlayer = role === 'player'
  const isCoach = role === 'coach'

  const user = {
    name: clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User',
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    role: role,
  }

  return (
    <SidebarLayout user={user}>
      {isPlayer && <PlayerDashboard />}
      {isCoach && <CoachDashboard />}
      {!isPlayer && !isCoach && (
        <div className='flex items-center justify-center p-16'>
          <p className='text-white'>No role assigned yet. Please contact support.</p>
        </div>
      )}
    </SidebarLayout>
  )
}
