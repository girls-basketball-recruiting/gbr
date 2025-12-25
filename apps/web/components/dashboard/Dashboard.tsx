import PlayerDashboard from '@/components/PlayerDashboard'
import CoachDashboard from '@/components/CoachDashboard'
import { getAuthContext } from '@/lib/auth-context'

export async function Dashboard() {
  const { clerkUser } = await getAuthContext()
  const role = clerkUser.publicMetadata?.role as string | undefined

  if (role === 'player') {
    return <PlayerDashboard />
  }

  if (role === 'coach') {
    return <CoachDashboard />
  }

  return (
    <div className='min-h-svh flex items-center justify-center bg-slate-50 dark:bg-slate-900'>
      <p className='text-slate-900 dark:text-white'>
        User has no role assigned.
      </p>
    </div>
  )
}
