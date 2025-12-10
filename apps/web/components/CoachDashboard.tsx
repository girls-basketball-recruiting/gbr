import { currentUser } from '@clerk/nextjs/server'

import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { EmptyState } from './ui/EmptyState'
import { PlayerCard } from './ui/PlayerCard'
import { ProspectCard } from './ui/ProspectCard'
import { StatCard } from './ui/StatCard'

interface CoachDashboardProps {
  // Empty for now
}

export default async function CoachDashboard({}: CoachDashboardProps) {
  // Fetch saved players for this coach
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const currentClerkUser = await currentUser()

  if (!currentClerkUser) {
    return null
  }

  // Find the PayloadCMS user
  const users = await payload.find({
    collection: 'users',
    where: {
      clerkId: {
        equals: currentClerkUser.id,
      },
    },
  })

  if (users.docs.length === 0) {
    return null
  }

  const payloadUser = users.docs[0]!

  // Find the coach profile
  const coaches = await payload.find({
    collection: 'coaches',
    where: {
      user: {
        equals: payloadUser.id,
      },
    },
  })

  if (coaches.docs.length === 0) {
    return null
  }

  const coachProfile = coaches.docs[0]!

  // Fetch saved players
  const savedPlayersData = await payload.find({
    collection: 'saved-players',
    where: {
      coach: {
        equals: coachProfile.id,
      },
    },
    depth: 2, // Include player details
    sort: '-savedAt',
  })

  // Extract the actual player data from saved players
  const players = savedPlayersData.docs
    .map((sp: any) => sp.player)
    .filter(Boolean)

  // Fetch prospects (manual entries by this coach)
  const prospectsData = await payload.find({
    collection: 'prospects',
    where: {
      coach: {
        equals: coachProfile.id,
      },
    },
    sort: '-createdAt',
  })

  const prospects = prospectsData.docs

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h2 className='text-3xl font-bold text-white'>Your Recruiting Board</h2>
          <div className='flex gap-3'>
            <Link href='/profile/edit'>
              <Button
                variant='outline'
                className='border-slate-600 text-white hover:bg-slate-800'
              >
                Edit Profile
              </Button>
            </Link>
            <Link href='/players'>
              <Button className='bg-blue-500 hover:bg-blue-600'>
                Browse All Players
              </Button>
            </Link>
          </div>
        </div>

        {/* Saved Players Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-2xl font-bold text-white'>
              Saved Players
              <span className='ml-2 text-sm font-normal text-slate-400'>
                (Registered on Platform)
              </span>
            </h3>
          </div>

          {players.length === 0 ? (
            <EmptyState
              title='No Saved Players Yet'
              description="You haven't saved any players yet. Browse all players to find recruits and save them to your board!"
              action={
                <Link href='/players'>
                  <Button className='mt-4 bg-blue-600 hover:bg-blue-700'>
                    Browse All Players
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {players.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          )}
        </div>

        {/* My Prospects Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-2xl font-bold text-white'>
              My Prospects
              <span className='ml-2 text-sm font-normal text-slate-400'>
                (Manual Entries)
              </span>
            </h3>
            <Link href='/prospects/create'>
              <Button className='bg-purple-600 hover:bg-purple-700'>
                + Add Prospect
              </Button>
            </Link>
          </div>

          {prospects.length === 0 ? (
            <EmptyState
              title='No Prospects Added Yet'
              description="Add prospects manually to track players who haven't registered on the platform yet."
              action={
                <Link href='/prospects/create'>
                  <Button className='mt-4 bg-purple-600 hover:bg-purple-700'>
                    + Add Your First Prospect
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {prospects.map((prospect: any) => (
                <ProspectCard key={prospect.id} prospect={prospect} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats Section */}
        <div className='grid md:grid-cols-3 gap-6 mb-8'>
          <StatCard label='Saved Players' value={players.length} />
          <StatCard label='My Prospects' value={prospects.length} />
          <StatCard
            label='Total Recruits'
            value={players.length + prospects.length}
          />
        </div>
      </div>
    </div>
  )
}
