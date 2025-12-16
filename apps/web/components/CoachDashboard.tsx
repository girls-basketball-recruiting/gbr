import { currentUser } from '@clerk/nextjs/server'

import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { EmptyState } from './ui/EmptyState'
import { PlayerCard } from './ui/PlayerCard'
import { ProspectCard } from './ui/ProspectCard'
import { StatCard } from './ui/StatCard'
import Image from 'next/image'

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

  // Fetch coach profile with depth to get profile image
  const coachWithImage = await payload.findByID({
    collection: 'coaches',
    id: coachProfile.id,
    depth: 1,
  })

  const profileImageUrl =
    coachWithImage?.profileImage &&
    typeof coachWithImage.profileImage === 'object'
      ? coachWithImage.profileImage.url
      : null

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
        {/* Coach Profile Header */}
        <div className='mb-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6'>
          <div className='flex items-center gap-6'>
            {profileImageUrl ? (
              <div className='w-24 h-24 rounded-full overflow-hidden bg-slate-700 relative flex-shrink-0'>
                <Image
                  src={profileImageUrl}
                  alt={coachWithImage.name}
                  fill
                  className='object-cover'
                />
              </div>
            ) : (
              <div className='w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0'>
                <span className='text-3xl font-bold text-white'>
                  {coachWithImage.name?.[0]}
                </span>
              </div>
            )}
            <div className='flex-1'>
              <h2 className='text-2xl font-bold text-white mb-1'>
                {coachWithImage.name}
              </h2>
              <p className='text-slate-400'>
                {coachWithImage.position && `${coachWithImage.position} • `}
                {coachWithImage.collegeName}
              </p>
              {coachWithImage.division && (
                <p className='text-slate-400 text-sm mt-1'>
                  {coachWithImage.division === 'd1' && 'NCAA D1'}
                  {coachWithImage.division === 'd2' && 'NCAA D2'}
                  {coachWithImage.division === 'd3' && 'NCAA D3'}
                  {coachWithImage.division === 'naia' && 'NAIA'}
                  {coachWithImage.division === 'juco' && 'JUCO'}
                  {coachWithImage.division === 'other' && 'Other'}
                  {coachWithImage.state && ` • ${coachWithImage.state}`}
                </p>
              )}
            </div>
            <div className='flex gap-2'>
              <Button asChild variant='outline'>
                <Link href='/profile'>View Profile</Link>
              </Button>
              <Button asChild variant='outline'>
                <Link href='/profile/edit'>Edit Profile</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Saved Players Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-2xl font-bold text-white'>
              Saved Players
              <span className='ml-2 text-sm font-normal text-slate-400'>
                (Registered Users)
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
