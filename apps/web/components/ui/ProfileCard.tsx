'use client'

import { Card } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import Image from 'next/image'
import { ReactNode } from 'react'
import { useAuth } from '@clerk/nextjs'
import { getPositionLabel } from '@/lib/zod/Positions'
import { formatHeight } from '@/lib/formatters'
import type { Player, CoachProspect } from '@/payload-types'
import { ButtonLink } from './ButtonLink'
import { User } from 'lucide-react'

type ProfileData = Player | CoachProspect

interface ProfileCardProps {
  profile: ProfileData
  variant: 'player' | 'prospect'
  action?: ReactNode
  isOwnCard?: boolean
}

function isPlayer(profile: ProfileData): profile is Player {
  return 'user' in profile && 'email' in profile
}

export function ProfileCard({ profile, variant, action, isOwnCard = false }: ProfileCardProps) {
  const { isSignedIn } = useAuth()
  const isPublic = !isSignedIn
  if (!profile) return null

  const profileImageUrl = profile.profileImageUrl
  const isArchived = isPlayer(profile) && !!profile.deletedAt
  // Hide stats in public view
  const hasStats = !isPublic && (profile.ppg || profile.rpg || profile.apg)
  const gradYear = profile.graduationYear

  // Build profile link based on variant
  const profileLink = variant === 'player'
    ? `/players/${profile.id}`
    : `/prospects/${profile.id}`

  return (
    <Card className={`overflow-hidden p-0 flex flex-col h-full min-w-[340px] transition-all ${
      isArchived ? 'opacity-60' : 'hover:shadow-xl hover:-translate-y-1'
    }`}>
      {/* Header Area - Subtle accent background */}
      <div className={`relative aspect-[4/3] rounded-b-3xl overflow-hidden ${
        variant === 'player'
          ? 'bg-orange-50 dark:bg-orange-950/40 border-b-2 border-orange-200 dark:border-orange-800'
          : 'bg-purple-50 dark:bg-purple-950/40 border-b-2 border-purple-200 dark:border-purple-800'
      }`}>
        {profileImageUrl ? (
          <Image
            src={profileImageUrl}
            alt={`${profile.firstName} ${profile.lastName}`}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            priority={false}
          />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className={`w-20 h-20 rounded-xl flex items-center justify-center border ${
              variant === 'player'
                ? 'bg-orange-100 dark:bg-orange-900/50 border-orange-200 dark:border-orange-700'
                : 'bg-purple-100 dark:bg-purple-900/50 border-purple-200 dark:border-purple-700'
            }`}>
              <User className={`w-10 h-10 ${
                variant === 'player'
                  ? 'text-orange-400 dark:text-orange-500'
                  : 'text-purple-400 dark:text-purple-500'
              }`} />
            </div>
          </div>
        )}

        {/* Own Profile Badge - Top Left (players only) */}
        {isOwnCard && variant === 'player' && (
          <div className='absolute top-3 left-3 bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg px-3 py-1.5 rounded-full text-xs font-bold tracking-wider text-white flex items-center gap-1.5'>
            <span className='text-amber-200'>★</span>
            <span>YOU</span>
          </div>
        )}

        {/* Prospect Badge - Top Left */}
        {variant === 'prospect' && (
          <div className='absolute top-3 left-3 bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg px-3 py-1.5 rounded-full text-xs font-bold tracking-wider text-white'>
            PROSPECT
          </div>
        )}

        {/* Graduation Year Badge - Top Right */}
        {gradYear && (
          <div className='absolute top-3 right-3'>
            <Badge className={`border-0 text-white text-sm px-3 py-1 font-bold shadow-lg ${
              variant === 'player'
                ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                : 'bg-gradient-to-br from-purple-500 to-purple-600'
            }`}>
              &apos;{String(gradYear).slice(-2)}
            </Badge>
          </div>
        )}

        {isArchived && (
          <div className='absolute top-0 left-0 right-0 bg-red-600/90 px-3 py-2 text-xs font-bold text-center text-white'>
            ARCHIVED
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className='p-5 pt-0 flex flex-col flex-1'>
        {/* Name & Position */}
        <div className='mb-4'>
          <h3 className='text-lg font-bold tracking-tight'>
            {profile.firstName} {profile.lastName}
          </h3>
          {profile.primaryPosition && (
            <p className='text-sm text-muted-foreground font-medium'>
              {getPositionLabel(profile.primaryPosition)}
            </p>
          )}
        </div>

        {/* Stats Row */}
        {hasStats && (
          <div className={`grid grid-cols-3 gap-2 rounded-xl p-3 mb-4 border ${
            variant === 'player'
              ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'
              : 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
          }`}>
            {profile.ppg !== null && profile.ppg !== undefined && (
              <div className='text-center'>
                <div className={`text-lg font-bold ${
                  variant === 'player'
                    ? 'text-orange-700 dark:text-orange-400'
                    : 'text-purple-700 dark:text-purple-400'
                }`}>
                  {Number(profile.ppg).toFixed(1)}
                </div>
                <div className={`text-[10px] uppercase font-semibold ${
                  variant === 'player'
                    ? 'text-orange-600/70 dark:text-orange-500/70'
                    : 'text-purple-600/70 dark:text-purple-500/70'
                }`}>
                  PPG
                </div>
              </div>
            )}
            {profile.rpg !== null && profile.rpg !== undefined && (
              <div className={`text-center border-x ${
                variant === 'player'
                  ? 'border-orange-200 dark:border-orange-800'
                  : 'border-purple-200 dark:border-purple-800'
              }`}>
                <div className={`text-lg font-bold ${
                  variant === 'player'
                    ? 'text-orange-700 dark:text-orange-400'
                    : 'text-purple-700 dark:text-purple-400'
                }`}>
                  {Number(profile.rpg).toFixed(1)}
                </div>
                <div className={`text-[10px] uppercase font-semibold ${
                  variant === 'player'
                    ? 'text-orange-600/70 dark:text-orange-500/70'
                    : 'text-purple-600/70 dark:text-purple-500/70'
                }`}>
                  RPG
                </div>
              </div>
            )}
            {profile.apg !== null && profile.apg !== undefined && (
              <div className='text-center'>
                <div className={`text-lg font-bold ${
                  variant === 'player'
                    ? 'text-orange-700 dark:text-orange-400'
                    : 'text-purple-700 dark:text-purple-400'
                }`}>
                  {Number(profile.apg).toFixed(1)}
                </div>
                <div className={`text-[10px] uppercase font-semibold ${
                  variant === 'player'
                    ? 'text-orange-600/70 dark:text-orange-500/70'
                    : 'text-purple-600/70 dark:text-purple-500/70'
                }`}>
                  APG
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key Info Grid */}
        <div className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4'>
          {profile.heightInInches && (
            <div>
              <div className='text-[10px] uppercase font-semibold text-muted-foreground tracking-wide'>
                Height
              </div>
              <div className='font-semibold'>{formatHeight(profile.heightInInches)}</div>
            </div>
          )}
          {profile.weight && (
            <div>
              <div className='text-[10px] uppercase font-semibold text-muted-foreground tracking-wide'>
                Weight
              </div>
              <div className='font-semibold'>{profile.weight} lbs</div>
            </div>
          )}
          {!isPublic && (profile.weightedGpa || profile.unweightedGpa) && (
            <div>
              <div className='text-[10px] uppercase font-semibold text-muted-foreground tracking-wide'>
                GPA
              </div>
              <div className='font-semibold'>
                {profile.weightedGpa || profile.unweightedGpa}
              </div>
            </div>
          )}
          {profile.highSchool && (
            <div className='col-span-2'>
              <div className='text-[10px] uppercase font-semibold text-muted-foreground tracking-wide'>
                School
              </div>
              <div className='font-medium truncate'>
                {profile.highSchool}
              </div>
            </div>
          )}
          {(profile.city || profile.state) && (
            <div className='col-span-2'>
              <div className='text-[10px] uppercase font-semibold text-muted-foreground tracking-wide'>
                Location
              </div>
              <div className='font-medium truncate'>
                {profile.city}
                {profile.city && profile.state && ', '}
                {profile.state}
              </div>
            </div>
          )}
        </div>

        {/* Actions - pushed to bottom */}
        <div className='mt-auto pt-4 flex gap-4 border-t justify-between'>
          {isArchived ? (
            <button
              className='flex-1 px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed'
              disabled
            >
              Unavailable
            </button>
          ) : (
            <ButtonLink href={profileLink} variant='secondary'>
              View Profile
            </ButtonLink>
          )}
          {action}
        </div>
      </div>
    </Card>
  )
}
