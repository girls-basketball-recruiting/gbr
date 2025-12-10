import { currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import PlayerDashboard from './PlayerDashboard'
import CoachDashboard from './CoachDashboard'

export default async function DashboardPage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return (
      <div className='min-h-svh flex items-center justify-center'>
        <p>Loading...</p>
      </div>
    )
  }

  const role = clerkUser.publicMetadata?.role as string | undefined
  const isPlayer = role === 'player'
  const isCoach = role === 'coach'

  return (
    <div className='min-h-svh bg-slate-900'>
      {/* Header */}
      <header className='bg-slate-800 border-b border-slate-700'>
        <div className='container mx-auto px-4 py-4 flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-white'>
              Girls Basketball Recruiting
            </h1>
            <p className='text-slate-400 text-sm'>
              Welcome back,{' '}
              {clerkUser?.firstName ||
                clerkUser?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
          <UserButton />
        </div>
      </header>

      {/* Main Content */}
      <main>
        {isPlayer && <PlayerDashboard />}
        {isCoach && <CoachDashboard />}
        {!isPlayer && !isCoach && (
          <div className='container mx-auto px-4 py-16 text-center text-white'>
            <p>No role assigned yet. Please contact support.</p>
          </div>
        )}
      </main>
    </div>
  )
}
