import type { Coach } from '@/payload-types'
import Image from 'next/image'
import { getCoachPositionLabel } from '@/lib/zod/CoachPositions'
import { MailIcon, PhoneIcon } from 'lucide-react'
import { H1, MutedText, P } from '../ui/typography'
import { CopyableText } from './copyable-text'
import Link from 'next/link'
import { ButtonLink } from '../ui/ButtonLink'
import { currentUser } from '@clerk/nextjs/server'
import { findOne } from '@/lib/payload-helpers'

interface CoachProfileViewProps {
  coach: Coach
}

export async function CoachProfileView({ coach }: CoachProfileViewProps) {
  const clerkUser = await currentUser()

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

  return (
    <div className='space-y-10 max-w-2xl'>
      {/* Hero Section */}
      <div className='relative'>
        <div className='flex flex-col md:flex-row gap-8 md:gap-12 items-start'>
          {/* Profile Image */}
          {coach.profileImageUrl && (
            <div className='w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden relative shrink-0 shadow-lg'>
              <Image
                src={coach.profileImageUrl}
                alt={`${coach.firstName} ${coach.lastName}`}
                fill
                className='object-cover'
                priority
              />
            </div>
          )}

          {/* Name & Key Info */}
          <div className='flex-1'>
            <div className='flex justify-between items-center'>
              <H1 className='text-left'>
                {coach.firstName} {coach.lastName}
              </H1>
              {isOwnProfile && (
                <div className='flex justify-end'>
                  <ButtonLink href='/profile/edit' size='lg' variant='outline'>
                    Edit Profile
                  </ButtonLink>
                </div>
              )}
            </div>
            <div className='flex flex-wrap items-center gap-3 mt-4'>
              {coach.jobTitle && (
                <P className='text-lg'>
                  {getCoachPositionLabel(coach.jobTitle)} @ <Link href={`/programs/${coach.collegeId}`} className='text-primary hover:underline'>{coach.collegeName}</Link>
                </P>
              )}
            </div>

            {/* Location */}
            {(coach.city || coach.state) && (
              <MutedText className='mb-6'>
                {coach.city}
                {coach.city && coach.state && ', '}
                {coach.state}
              </MutedText>
            )}

            {coach.email && (
              <div>
                <CopyableText
                  icon={<MailIcon className='w-4 h-4' />}
                  text={coach.email}
                  successMsg='Email copied to clipboard!'
                  errorMsg='Failed to copy email'
                />
              </div>
            )}
            {coach.phone && (
              <div className='mt-2'>
                <CopyableText
                  icon={<PhoneIcon className='w-4 h-4' />}
                  text={coach.phone}
                  successMsg='Phone number copied to clipboard!'
                  errorMsg='Failed to copy phone number'
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {coach.bio && (
        <div className='max-w-3xl'>
          <MutedText className='uppercase font-extrabold'>
            About Our Program
          </MutedText>
          <P className='mt-4 text-accent-foreground'>
            {coach.bio}
          </P>
        </div>
      )}
    </div>
  )
}
