import { getPayload } from 'payload'
import config from '@/payload.config'
import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin,
  Building2,
  GraduationCap,
  School,
  BadgeCheck,
} from 'lucide-react'

interface ProgramPageProps {
  params: Promise<{ id: string }>
}

const divisionLabels: Record<string, string> = {
  d1: 'NCAA Division I',
  d2: 'NCAA Division II',
  d3: 'NCAA Division III',
  naia: 'NAIA',
  juco: 'Junior College',
  other: 'Other',
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { id } = await params

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch the college
  let college
  try {
    college = await payload.findByID({
      collection: 'colleges',
      id: parseInt(id),
    })
  } catch (error) {
    notFound()
  }

  // Find coaches for this college
  const coaches = await payload.find({
    collection: 'coaches',
    where: {
      collegeId: {
        equals: parseInt(id),
      },
    },
    depth: 1, // Include profile images
  })

  const hasCoaches = coaches.docs.length > 0

  return (
    <div className='p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Breadcrumb */}
        <div className='mb-6'>
          <Link
            href='/programs'
            className='text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm'
          >
            ← Back to Programs
          </Link>
        </div>

        {/* Program Header */}
        <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-8 mb-8'>
          <div className='flex items-start justify-between mb-6'>
            <div>
              <h1 className='text-4xl font-bold text-slate-900 dark:text-white mb-2'>
                {college.school}
              </h1>
              <p className='text-xl text-slate-600 dark:text-slate-400'>
                Women's Basketball Program
              </p>
            </div>
            {hasCoaches && (
              <div className='flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/50 rounded-lg'>
                <BadgeCheck className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                <span className='text-sm font-medium text-blue-600 dark:text-blue-400'>
                  {coaches.docs.length} {coaches.docs.length === 1 ? 'Coach' : 'Coaches'} on Platform
                </span>
              </div>
            )}
          </div>

          <div className='grid md:grid-cols-2 gap-6'>
            {/* Location */}
            <div className='flex items-start gap-3'>
              <MapPin className='w-5 h-5 text-slate-600 dark:text-slate-400 mt-1' />
              <div>
                <h3 className='text-sm font-medium text-slate-600 dark:text-slate-400 mb-1'>
                  Location
                </h3>
                <p className='text-slate-900 dark:text-white'>
                  {college.city}, {college.state}
                </p>
              </div>
            </div>

            {/* Division */}
            <div className='flex items-start gap-3'>
              <GraduationCap className='w-5 h-5 text-slate-600 dark:text-slate-400 mt-1' />
              <div>
                <h3 className='text-sm font-medium text-slate-600 dark:text-slate-400 mb-1'>
                  Division
                </h3>
                <p className='text-slate-900 dark:text-white'>
                  {divisionLabels[college.division] || college.division}
                </p>
              </div>
            </div>

            {/* Type */}
            <div className='flex items-start gap-3'>
              <Building2 className='w-5 h-5 text-slate-600 dark:text-slate-400 mt-1' />
              <div>
                <h3 className='text-sm font-medium text-slate-600 dark:text-slate-400 mb-1'>
                  Institution Type
                </h3>
                <p className='text-slate-900 dark:text-white capitalize'>{college.type}</p>
              </div>
            </div>

            {/* Conference */}
            {college.conference && (
              <div className='flex items-start gap-3'>
                <School className='w-5 h-5 text-slate-600 dark:text-slate-400 mt-1' />
                <div>
                  <h3 className='text-sm font-medium text-slate-600 dark:text-slate-400 mb-1'>
                    Conference
                  </h3>
                  <p className='text-slate-900 dark:text-white'>{college.conference}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Coaches Section */}
        {hasCoaches && (
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
              Coaching Staff on Platform
            </h2>
            <div className='grid md:grid-cols-2 gap-6'>
              {coaches.docs.map((coach: any) => (
                <Card
                  key={coach.id}
                  className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6'
                >
                  <div className='flex items-start gap-4'>
                    {coach.profileImage &&
                    typeof coach.profileImage === 'object' &&
                    coach.profileImage.url ? (
                      <div className='w-16 h-16 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 relative flex-shrink-0'>
                        <Image
                          src={coach.profileImage.url}
                          alt={coach.name}
                          fill
                          className='object-cover'
                        />
                      </div>
                    ) : (
                      <div className='w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0'>
                        <span className='text-2xl font-bold text-slate-900 dark:text-white'>
                          {coach.name?.[0]}
                        </span>
                      </div>
                    )}

                    <div className='flex-1'>
                      <h3 className='text-lg font-semibold text-slate-900 dark:text-white mb-1'>
                        {coach.name}
                      </h3>
                      {coach.position && (
                        <p className='text-slate-600 dark:text-slate-400 text-sm mb-2'>
                          {coach.position}
                        </p>
                      )}
                      {coach.programName && (
                        <p className='text-slate-600 dark:text-slate-400 text-sm mb-3'>
                          {coach.programName}
                        </p>
                      )}
                      <Button
                        size='sm'
                        className='bg-blue-600 hover:bg-blue-700'
                        asChild
                      >
                        <Link href={`/coaches/${coach.id}`}>View Profile</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Coaches Message */}
        {!hasCoaches && (
          <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-8'>
            <div className='text-center'>
              <h3 className='text-xl font-semibold text-slate-900 dark:text-white mb-2'>
                No Coaches Registered Yet
              </h3>
              <p className='text-slate-600 dark:text-slate-400 mb-4'>
                There are currently no coaches from this program registered on
                the platform.
              </p>
              <p className='text-slate-600 dark:text-slate-400 text-sm'>
                Are you a coach for {college.school}?{' '}
                <Link
                  href='/register-coach'
                  className='text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                >
                  Register here
                </Link>
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
