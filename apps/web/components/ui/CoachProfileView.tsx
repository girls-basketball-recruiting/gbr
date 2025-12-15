import { Card } from '@workspace/ui/components/card'
import Image from 'next/image'

interface CoachProfileViewProps {
  coach: any
}

const divisionLabels: Record<string, string> = {
  d1: 'NCAA D1',
  d2: 'NCAA D2',
  d3: 'NCAA D3',
  naia: 'NAIA',
  juco: 'JUCO',
  other: 'Other',
}

const regionLabels: Record<string, string> = {
  'new-england': 'New England',
  'mid-atlantic': 'Mid-Atlantic',
  southeast: 'Southeast',
  southwest: 'Southwest',
  midwest: 'Midwest',
  'mountain-west': 'Mountain West',
  'west-coast': 'West Coast',
  'pacific-northwest': 'Pacific Northwest',
}

export function CoachProfileView({ coach }: CoachProfileViewProps) {
  return (
    <>
      {/* Coach Header */}
      <Card className='bg-slate-800/50 border-slate-700 p-8 mb-8'>
          <div className='flex items-start gap-6'>
            {/* Profile Image */}
            {coach.profileImage &&
              typeof coach.profileImage === 'object' &&
              coach.profileImage.url && (
                <div className='w-24 h-24 rounded-full overflow-hidden bg-slate-700 relative flex-shrink-0'>
                  <Image
                    src={coach.profileImage.url}
                    alt={coach.name}
                    fill
                    className='object-cover'
                  />
                </div>
              )}

            {/* Coach Info */}
            <div className='flex-1'>
              <h1 className='text-4xl font-bold text-white mb-2'>
                {coach.name}
              </h1>
              {coach.position && (
                <p className='text-xl text-slate-400 mb-1'>{coach.position}</p>
              )}
              <p className='text-lg text-blue-400'>{coach.university}</p>
            </div>
          </div>
        </Card>

        {/* Coach Details */}
        <div className='grid md:grid-cols-2 gap-8 mb-8'>
          <Card className='bg-slate-800/50 border-slate-700 p-6'>
            <h2 className='text-2xl font-bold text-white mb-4'>
              Program Information
            </h2>
            <div className='space-y-3 text-slate-300'>
              {coach.university && (
                <div>
                  <span className='text-slate-400'>University:</span>{' '}
                  <span className='font-medium'>{coach.university}</span>
                </div>
              )}
              {coach.programName && (
                <div>
                  <span className='text-slate-400'>Program:</span>{' '}
                  <span className='font-medium'>{coach.programName}</span>
                </div>
              )}
              {coach.division && (
                <div>
                  <span className='text-slate-400'>Division:</span>{' '}
                  <span className='font-medium'>
                    {divisionLabels[coach.division] || coach.division}
                  </span>
                </div>
              )}
              {coach.state && (
                <div>
                  <span className='text-slate-400'>State:</span>{' '}
                  <span className='font-medium'>{coach.state}</span>
                </div>
              )}
              {coach.region && (
                <div>
                  <span className='text-slate-400'>Region:</span>{' '}
                  <span className='font-medium'>
                    {regionLabels[coach.region] || coach.region}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Card className='bg-slate-800/50 border-slate-700 p-6'>
            <h2 className='text-2xl font-bold text-white mb-4'>Contact</h2>
            <div className='space-y-3 text-slate-300'>
              {coach.email && (
                <div>
                  <span className='text-slate-400'>Email:</span>{' '}
                  <a
                    href={`mailto:${coach.email}`}
                    className='font-medium text-blue-400 hover:text-blue-300'
                  >
                    {coach.email}
                  </a>
                </div>
              )}
              {coach.phone && (
                <div>
                  <span className='text-slate-400'>Phone:</span>{' '}
                  <a
                    href={`tel:${coach.phone}`}
                    className='font-medium text-blue-400 hover:text-blue-300'
                  >
                    {coach.phone}
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>

      {/* Bio */}
      {coach.bio && (
        <Card className='bg-slate-800/50 border-slate-700 p-6'>
          <h2 className='text-2xl font-bold text-white mb-4'>About</h2>
          <p className='text-slate-300 whitespace-pre-wrap'>{coach.bio}</p>
        </Card>
      )}
    </>
  )
}
