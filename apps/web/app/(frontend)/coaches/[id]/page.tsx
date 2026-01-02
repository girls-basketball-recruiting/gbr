import { notFound } from 'next/navigation'
import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import Image from 'next/image'
import { currentUser } from '@clerk/nextjs/server'
import { CoachProfileView } from '@/components/profile/coach-profile-view'
import type { Metadata } from 'next'
import { getCoachPositionLabel } from '@/lib/zod/CoachPositions'
import { findById, findOne } from '@/lib/payload-helpers'

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  try {
    const coach = await findById('coaches', id)

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
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const clerkUser = await currentUser()

  // Fetch the coach
  const coach = await findById('coaches', id)

  if (!coach) {
    notFound()
  }

  // Check if user is authenticated
  const isAuthenticated = !!clerkUser

  // Check if current user owns this profile
  let isOwnProfile = false

  if (clerkUser) {
    const user = await findOne('users', { clerkId: { equals: clerkUser.id } })

    if (user) {
      // Check if this is the user's own coach profile
      const ownCoachProfile = await findOne('coaches', {
        user: { equals: user.id }
      })

      if (ownCoachProfile && ownCoachProfile.id === coach.id) {
        isOwnProfile = true
      }
    }
  }

  // If not authenticated, show limited public view for SEO
  if (!isAuthenticated) {
    return (
      <div className='min-h-svh bg-slate-50 dark:bg-slate-900 py-12'>
        <div className='container mx-auto px-4 max-w-3xl'>
          {/* Public Coach Profile */}
          <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-8 mb-8'>
            <div className='text-center space-y-6'>
              {/* Profile Image */}
              {coach.profileImageUrl && (
                <div className='flex justify-center'>
                  <div className='w-32 h-32 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 relative'>
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
                <h1 className='text-4xl font-bold text-slate-900 dark:text-white mb-2'>
                  {coach.firstName} {coach.lastName}
                </h1>
                {coach.jobTitle && (
                  <p className='text-xl text-slate-600 dark:text-slate-400 mb-1'>
                    {getCoachPositionLabel(coach.jobTitle)}
                  </p>
                )}
                <p className='text-lg text-blue-600 dark:text-blue-400'>
                  {coach.collegeName}
                </p>
              </div>

              {/* Limited Info */}
              <div className='space-y-3 text-slate-700 dark:text-slate-300 max-w-md mx-auto'>
                {(coach.city || coach.state) && (
                  <div className='flex items-center justify-center gap-2'>
                    <span className='text-slate-600 dark:text-slate-400'>Location:</span>
                    <span className='font-medium'>
                      {coach.city}{coach.city && coach.state && ', '}{coach.state}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA to Sign Up */}
              <div className='pt-6 border-t border-slate-200 dark:border-slate-700'>
                <p className='text-slate-600 dark:text-slate-400 mb-4'>
                  Sign in to view full profile and contact information
                </p>
                <div className='flex flex-col gap-3'>
                  <Link href='/sign-in' className='w-full cursor-pointer'>
                    <Button className='w-full bg-blue-600 hover:bg-blue-700'>
                      Sign In
                    </Button>
                  </Link>
                  <div className='flex gap-3'>
                    <Link href='/register-player' className='flex-1 cursor-pointer'>
                      <Button variant='outline' className='w-full border-orange-500 text-orange-500 hover:bg-orange-500/10'>
                        Register as Player
                      </Button>
                    </Link>
                    <Link href='/register-coach' className='flex-1 cursor-pointer'>
                      <Button variant='outline' className='w-full border-blue-500 text-blue-500 hover:bg-blue-500/10'>
                        Register as Coach
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className='p-8'>
      <div className='max-w-5xl mx-auto space-y-8'>
        {/* Edit button for own profile */}
        {isOwnProfile && (
          <div className='flex justify-end'>
            <Link href='/profile/edit'>
              <Button variant='outline' size='lg' className='cursor-pointer'>
                Edit Profile
              </Button>
            </Link>
          </div>
        )}

        {/* Coach Profile View - Using same component as /profile */}
        <CoachProfileView coach={coach} />
      </div>
    </div>
  )
}
