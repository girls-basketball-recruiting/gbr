import { notFound } from 'next/navigation'
import { Card } from '@workspace/ui/components/card'
import Image from 'next/image'
import { currentUser } from '@clerk/nextjs/server'
import { CoachProfileView } from '@/components/profile/coach-profile-view'
import type { Metadata } from 'next'
import { getCoachPositionLabel } from '@/lib/zod/CoachPositions'
import { findById } from '@/lib/payload-helpers'
import { PublicNav } from '@/components/PublicNav'
import { ButtonLink } from '@/components/ui/ButtonLink'
import type { Coach } from '@/payload-types'

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; coachId: string }>
}): Promise<Metadata> {
  const { coachId } = await params

  try {
    const coach = await findById('coaches', coachId)

    if (!coach) {
      return {
        title: 'Coach Not Found',
      }
    }

    const fullName = `${coach.firstName} ${coach.lastName}`
    const position = coach.jobTitle
      ? getCoachPositionLabel(coach.jobTitle)
      : ''
    const college = coach.collegeName || ''

    const title = `${fullName} - ${position} | ${college}`
    const description = `${fullName} is the ${position} at ${college}. Connect with this college basketball coach.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'profile',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    }
  } catch {
    return {
      title: 'Coach Profile',
    }
  }
}

export default async function CoachProfilePage({
  params,
}: {
  params: Promise<{ id: string; coachId: string }>
}) {
  const { id: programId, coachId } = await params
  const clerkUser = await currentUser()

  // Fetch the coach
  const coach = await findById('coaches', coachId) as Coach | null

  if (!coach) {
    notFound()
  }

  const programIdNum = parseInt(programId, 10)
  if (isNaN(programIdNum)) {
    notFound()
  }

  // Verify coach belongs to this program
  if (coach.collegeId !== programIdNum) {
    notFound()
  }

  // Check if user is authenticated
  const isAuthenticated = !!clerkUser

  // If not authenticated, show limited public view for SEO
  if (!isAuthenticated) {
    return (
      <>
        {/* Show programs nav since this is a nested route under programs */}
        <PublicNav activePage='programs' />
        <div className='py-12 px-4'>
          <div className='container mx-auto max-w-3xl'>
          {/* Public Coach Profile */}
          <Card className='p-8 mb-8'>
            <div className='text-center space-y-6'>
              {/* Profile Image */}
              {coach.profileImageUrl && (
                <div className='flex justify-center'>
                  <div className='w-32 h-32 rounded-full overflow-hidden relative'>
                    <Image
                      src={coach.profileImageUrl}
                      alt={`${coach.firstName} ${coach.lastName}`}
                      fill
                      className='object-cover'
                    />
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <h1 className='text-4xl font-bold mb-2'>
                  {coach.firstName} {coach.lastName}
                </h1>
                {coach.jobTitle && (
                  <p className='text-xl mb-1'>
                    {getCoachPositionLabel(coach.jobTitle)}
                  </p>
                )}
                <p className='text-lg'>
                  {coach.collegeName}
                </p>
              </div>

              {/* Limited Info */}
              <div className='space-y-3 max-w-md mx-auto'>
                {(coach.city || coach.state) && (
                  <div className='flex items-center justify-center gap-2'>
                    <span>Location:</span>
                    <span className='font-medium'>
                      {coach.city}{coach.city && coach.state && ', '}{coach.state}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA to Sign Up */}
              <div className='pt-6 border-t'>
                <p className='mb-4'>
                  Sign in or register to view full profile and contact information
                </p>
                <div className='text-center space-x-3'>
                  <ButtonLink href='/sign-in' variant='outline'>
                    Sign In
                  </ButtonLink>
                  <ButtonLink href='/register-player'>
                    Register as Player
                  </ButtonLink>
                  <ButtonLink href='/register-coach' variant='secondary'>
                    Register as Coach
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Card>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className='max-w-5xl mx-auto'>
      {/* Coach Profile View - Using same component as /profile */}
      <CoachProfileView coach={coach} />
    </div>
  )
}
