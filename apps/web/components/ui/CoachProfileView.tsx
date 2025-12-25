import { Card } from '@workspace/ui/components/card'
import Image from 'next/image'
import { getCoachPositionLabel } from '@/lib/zod/CoachPositions'

interface CoachProfileViewProps {
  coach: any
}

export function CoachProfileView({ coach }: CoachProfileViewProps) {
  return (
    <>
      {/* Coach Header */}
      <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-8 mb-8'>
          <div className='flex items-start gap-6'>
            {/* Profile Image */}
            {coach.profileImage &&
              typeof coach.profileImage === 'object' &&
              coach.profileImage.url && (
                <div className='w-24 h-24 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 relative flex-shrink-0'>
                  <Image
                    src={coach.profileImage.url}
                    alt={coach.firstName}
                    fill
                    className='object-cover'
                  />
                </div>
              )}

            {/* Coach Info */}
            <div className='flex-1'>
              <h1 className='text-4xl font-bold text-slate-900 dark:text-white mb-2'>
                {coach.firstName} {coach.lastName}
              </h1>
              {coach.position && (
                <p className='text-xl text-slate-600 dark:text-slate-400 mb-1'>{getCoachPositionLabel(coach.position)}</p>
              )}
              <p className='text-lg text-blue-600 dark:text-blue-400'>{coach.collegeName}</p>
            </div>
          </div>
        </Card>

        {/* Coach Details */}
        <div className='grid md:grid-cols-2 gap-8 mb-8'>
          <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6'>
            <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
              Program Information
            </h2>
            <div className='space-y-3 text-slate-700 dark:text-slate-300'>
              {coach.collegeName && (
                <div>
                  <span className='text-slate-600 dark:text-slate-400'>College:</span>{' '}
                  <span className='font-medium'>{coach.collegeName}</span>
                </div>
              )}
            </div>
          </Card>

          <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6'>
            <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>Contact</h2>
            <div className='space-y-3 text-slate-700 dark:text-slate-300'>
              {coach.email && (
                <div>
                  <span className='text-slate-600 dark:text-slate-400'>Email:</span>{' '}
                  <a
                    href={`mailto:${coach.email}`}
                    className='font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                  >
                    {coach.email}
                  </a>
                </div>
              )}
              {coach.phone && (
                <div>
                  <span className='text-slate-600 dark:text-slate-400'>Phone:</span>{' '}
                  <a
                    href={`tel:${coach.phone}`}
                    className='font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
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
        <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6'>
          <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>About</h2>
          <p className='text-slate-700 dark:text-slate-300 whitespace-pre-wrap'>{coach.bio}</p>
        </Card>
      )}
    </>
  )
}
