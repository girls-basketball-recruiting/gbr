import { Card } from '@workspace/ui/components/card'
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
import { getCoachPositionLabel } from '@/lib/zod/CoachPositions'
import { findById, findAll } from '@/lib/payload-helpers'
import { divisionLabels } from '@/lib/zod/LevelsOfPlay'
import { currentUser } from '@clerk/nextjs/server'
import { UnauthenticatedCTA } from '@/components/UnauthenticatedCTA'
import { PublicNav } from '@/components/PublicNav'
import { SaveProgramButton } from '@/components/SaveProgramButton'
import { isProgramSaved } from '@/actions/player-program-actions'
import { ButtonLink } from '@/components/ui/ButtonLink'

interface ProgramPageProps {
  params: Promise<{ id: string }>
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { id } = await params

  const college = await findById('colleges', id)

  if (!college) {
    notFound()
  }

  const clerkUser = await currentUser()
  const isLoggedOut = !clerkUser
  const isPlayer = clerkUser?.publicMetadata?.role === 'player'

  const coaches = await findAll('coaches', {
    collegeId: { equals: parseInt(id) },
  })

  const hasCoaches = coaches.length > 0

  // Check if player has saved this program
  const isSaved = isPlayer ? await isProgramSaved(parseInt(id)) : false

  return (
    <>
      {isLoggedOut && <PublicNav activePage='programs' />}
      <div className={isLoggedOut ? 'py-12 px-5 sm:px-10' : 'px-5 sm:px-10'}>
        <div className='max-w-lg mx-auto'>
          {/* Unauthenticated CTA */}
          {isLoggedOut && (
            <div className='mb-8'>
              <UnauthenticatedCTA
                title='Connect with College Programs'
                description='Create an account to view coach contact information, send messages to coaching staff, and get recruited to play college basketball.'
                variant='premium'
              />
            </div>
          )}

          {/* Program Header */}
          <Card className='max-w-lg p-5 sm:p-10 mb-8 bg-accent rounded-lg border-accent-foreground/10'>
            <div>
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <h1 className='text-2xl sm:text-4xl font-bold mb-2'>
                    {college.school}
                  </h1>
                  <p className='text-lg sm:text-xl'>
                    Women&apos;s Basketball Program
                  </p>
                </div>
              </div>
              {isPlayer && (
                <div className='flex gap-2'>
                  <SaveProgramButton
                    collegeId={parseInt(id)}
                    collegeName={college.school}
                    initialIsSaved={isSaved}
                    size='default'
                    variant='outline'
                    className='w-full'
                  />
                </div>
              )}
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
              {/* Location */}
              <div className='flex items-start gap-3'>
                <div className='w-6 min-w-6'>
                  <MapPin />
                </div>
                <div>
                  <h3 className='text-sm font-medium mb-1'>
                    Location
                  </h3>
                  <p>
                    {college.city}, {college.state}
                  </p>
                </div>
              </div>

              {/* Division */}
              <div className='flex items-start gap-3'>
                <div className='w-6 min-w-6'>
                  <GraduationCap />
                </div>
                <div>
                  <h3 className='text-sm font-medium mb-1'>
                    Division
                  </h3>
                  <p>
                    {divisionLabels[college.division] || college.division}
                  </p>
                </div>
              </div>

              {/* Type */}
              <div className='flex items-start gap-3'>
                <div className='w-6 min-w-6'>
                  <Building2 />
                </div>
                <div>
                  <h3 className='text-sm font-medium mb-1'>
                    Institution Type
                  </h3>
                  <p className='capitalize'>
                    {college.type}
                  </p>
                </div>
              </div>

              {/* Conference */}
              {college.conference && (
                <div className='flex items-start gap-3'>
                  <div className='w-6 min-w-6'>
                    <School />
                  </div>
                  <div>
                    <h3 className='text-sm font-medium mb-1'>
                      Conference
                    </h3>
                    <p>
                      {college.conference}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {hasCoaches && (
              <div>
                <div className='flex items-center my-6 gap-2 px-3 py-2 border border-primary text-primary rounded-lg shrink-0'>
                  <BadgeCheck className='w-5 h-5' />
                  <span className='text-sm font-medium'>
                    {coaches.length}{' '}
                    {coaches.length === 1 ? 'Coach' : 'Coaches'} on Platform
                  </span>
                </div>
                <div className='grid gap-4 sm:gap-6'>
                  {coaches.map((coach: any) => (
                    <Card
                      key={coach.id}
                      className='py-4 px-4 sm:px-6'
                    >
                      <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4'>
                        <div className='flex items-center gap-3 sm:gap-4'>
                          {coach.profileImageUrl ? (
                            <div className='w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden relative shrink-0'>
                              <Image
                                src={coach.profileImageUrl}
                                alt={coach.firstName + ' ' + coach.lastName}
                                fill
                                className='object-cover'
                              />
                            </div>
                          ) : (
                            <div className='w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0'>
                              <span className='text-xl sm:text-2xl font-bold'>
                                {coach.firstName[0] + coach.lastName[0]}
                              </span>
                            </div>
                          )}

                          <div className='flex-1 min-w-0'>
                            <h3 className='text-base sm:text-lg font-semibold'>
                              {coach.firstName} {coach.lastName}
                            </h3>
                            {coach.jobTitle && (
                              <p className='text-sm'>
                                {getCoachPositionLabel(coach.jobTitle)}
                              </p>
                            )}
                          </div>
                        </div>
                        <ButtonLink
                          size='sm'
                          href={`/programs/${id}/coaches/${coach.id}`}
                          className='w-full sm:w-auto sm:shrink-0'
                        >
                          View Profile
                        </ButtonLink>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* No Coaches Message */}
          {!hasCoaches && (
            <Card className='p-8'>
              <div className='text-center'>
                <h3 className='text-xl font-semibold mb-2'>
                  No Coaches Registered Yet
                </h3>
                <p>
                  There are currently no coaches from this program registered on
                  the platform.
                </p>
                {!clerkUser && (
                  <p className='text-sm mt-4'>
                    Are you a coach for {college.school}?{' '}
                    <Link
                      href='/register-coach'
                      className='hover:underline cursor-pointer text-primary'
                    >
                      Register here
                    </Link>
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
