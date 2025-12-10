import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { EmptyState } from './ui/EmptyState'
import { StatCard } from './ui/StatCard'

interface PlayerDashboardProps {
  // Empty for now
}

export default async function PlayerDashboard({}: PlayerDashboardProps) {
  // Fetch all coaches from the database
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const coachesData = await payload.find({
    collection: 'coaches',
    limit: 12,
    sort: '-createdAt',
  })

  const coaches = coachesData.docs

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h2 className='text-3xl font-bold text-white'>Your Dashboard</h2>
          <Link href='/profile/edit'>
            <Button className='bg-orange-500 hover:bg-orange-600'>
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Coaches Section */}
        <div className='mb-8'>
          <h3 className='text-2xl font-bold text-white mb-4'>
            College Coaches & Programs
          </h3>

          {coaches.length === 0 ? (
            <EmptyState
              title='No Coaches Yet'
              description='No coaches have created profiles yet. Check back soon to explore college programs!'
            />
          ) : (
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {coaches.map((coach) => (
                <Card
                  key={coach.id}
                  className='bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors'
                >
                  <div className='p-6 space-y-4'>
                    <div>
                      <h4 className='text-xl font-semibold text-white'>
                        {coach.name}
                      </h4>
                      <p className='text-slate-400 text-sm'>
                        {coach.university}
                      </p>
                    </div>

                    <div className='space-y-2 text-sm'>
                      {coach.programName && (
                        <div className='flex items-center gap-2'>
                          <span className='text-slate-400'>Program:</span>
                          <span className='text-white'>
                            {coach.programName}
                          </span>
                        </div>
                      )}
                      {coach.position && (
                        <div className='flex items-center gap-2'>
                          <span className='text-slate-400'>Position:</span>
                          <span className='text-white'>{coach.position}</span>
                        </div>
                      )}
                      {coach.division && (
                        <div className='flex items-center gap-2'>
                          <span className='text-slate-400'>Division:</span>
                          <span className='text-white uppercase'>
                            {coach.division === 'd1' && 'NCAA D1'}
                            {coach.division === 'd2' && 'NCAA D2'}
                            {coach.division === 'd3' && 'NCAA D3'}
                            {coach.division === 'naia' && 'NAIA'}
                            {coach.division === 'juco' && 'JUCO'}
                            {coach.division === 'other' && 'Other'}
                          </span>
                        </div>
                      )}
                      {coach.state && (
                        <div className='flex items-center gap-2'>
                          <span className='text-slate-400'>Location:</span>
                          <span className='text-white'>{coach.state}</span>
                        </div>
                      )}
                    </div>

                    {coach.bio && (
                      <p className='text-slate-300 text-sm line-clamp-3'>
                        {coach.bio}
                      </p>
                    )}

                    <div className='pt-4 flex gap-2'>
                      <Button
                        className='flex-1 bg-blue-600 hover:bg-blue-700'
                        asChild
                      >
                        <Link href={`/coaches/${coach.id}`}>View Profile</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats Section */}
        <div className='grid md:grid-cols-3 gap-6 mb-8'>
          <StatCard label='Profile Views' value={0} />
          <StatCard label='Available Coaches' value={coachesData.totalDocs} />
          <StatCard label='This Month' value={coaches.length} />
        </div>
      </div>
    </div>
  )
}
