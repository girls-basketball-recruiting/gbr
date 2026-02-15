'use client'

import { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { User, MapPin, Instagram, TwitterIcon } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { getPositionLabel } from '@/lib/zod/Positions'
import { formatHeight } from '@/lib/formatters'
import type { CoachProspect } from '@/payload-types'

interface ProspectTableRowProps {
  prospect: CoachProspect
  action?: ReactNode
}

export function ProspectTableRow({ prospect, action }: ProspectTableRowProps) {
  const profileLink = `/prospects/${prospect.id}`

  const hasLocation = prospect.city || prospect.state
  const location = hasLocation
    ? [prospect.city, prospect.state].filter(Boolean).join(', ')
    : null

  return (
    <div className='group flex items-stretch gap-4 px-4 py-3'>
      {/* Avatar */}
      <div className='shrink-0 self-center'>
        <div className='relative w-14 h-14 rounded-lg overflow-hidden bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60'>
          {prospect.profileImageUrl ? (
            <Image
              src={prospect.profileImageUrl}
              alt={`${prospect.firstName} ${prospect.lastName}`}
              fill
              className='object-cover'
              sizes='56px'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <User className='w-6 h-6 text-purple-400 dark:text-purple-500' />
            </div>
          )}
        </div>
      </div>

      {/* Content - Two Rows */}
      <div className='flex-1 min-w-0 flex flex-col justify-center gap-1'>
        {/* Row 1: Name (full width on mobile) */}
        <div className='flex items-center gap-2 min-w-0'>
          <Link
            href={profileLink}
            className='font-semibold text-purple-600 dark:text-purple-400 hover:underline truncate'
          >
            {prospect.firstName} {prospect.lastName}
          </Link>
          {/* Position & Badges - visible on md+ */}
          {prospect.primaryPosition && (
            <span className='hidden md:flex items-center gap-2'>
              <span className='text-muted-foreground/40'>/</span>
              <span className='text-sm text-muted-foreground truncate'>
                {getPositionLabel(prospect.primaryPosition)}
              </span>
            </span>
          )}
          {prospect.graduationYear && (
            <Badge variant='secondary' className='hidden md:inline-flex text-[10px] px-1.5 py-0 h-5 shrink-0'>
              &apos;{String(prospect.graduationYear).slice(-2)}
            </Badge>
          )}
          <Badge className='hidden md:inline-flex bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 text-[10px] px-1.5 py-0 h-5 shrink-0'>
            PROSPECT
          </Badge>
          {/* Social Handles */}
          {(prospect.xHandle || prospect.instaHandle || prospect.tiktokHandle) && (
            <span className='hidden md:flex items-center gap-2 ml-1'>
              {prospect.xHandle && (
                <a
                  href={`https://x.com/${prospect.xHandle.replace('@', '')}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors'
                  title={`@${prospect.xHandle.replace('@', '')}`}
                >
                  <TwitterIcon className='w-3.5 h-3.5' />
                </a>
              )}
              {prospect.instaHandle && (
                <a
                  href={`https://instagram.com/${prospect.instaHandle.replace('@', '')}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors'
                  title={`@${prospect.instaHandle.replace('@', '')}`}
                >
                  <Instagram className='w-3.5 h-3.5' />
                </a>
              )}
              {prospect.tiktokHandle && (
                <a
                  href={`https://tiktok.com/@${prospect.tiktokHandle.replace('@', '')}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors'
                  title={`@${prospect.tiktokHandle.replace('@', '')}`}
                >
                  <svg className='w-3.5 h-3.5' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z' />
                  </svg>
                </a>
              )}
            </span>
          )}
        </div>

        {/* Row 2 Mobile: Position / Year / Badges (mobile only) */}
        <div className='flex md:hidden items-center gap-2 flex-wrap'>
          {prospect.primaryPosition && (
            <span className='text-sm text-muted-foreground'>
              {getPositionLabel(prospect.primaryPosition)}
            </span>
          )}
          {prospect.graduationYear && (
            <Badge variant='secondary' className='text-[10px] px-1.5 py-0 h-5 shrink-0'>
              &apos;{String(prospect.graduationYear).slice(-2)}
            </Badge>
          )}
          {(prospect.heightInInches || prospect.weight) && (
            <span className='text-sm text-muted-foreground'>
              {prospect.heightInInches && formatHeight(prospect.heightInInches)}
              {prospect.heightInInches && prospect.weight && ' / '}
              {prospect.weight && `${prospect.weight} lbs`}
            </span>
          )}
          <Badge className='bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 text-[10px] px-1.5 py-0 h-5 shrink-0'>
            PROSPECT
          </Badge>
        </div>

        {/* Row 2 Desktop: Physical / Stats / Location / School */}
        <div className='hidden md:flex items-center gap-2 text-sm text-muted-foreground'>
          {/* Physical */}
          {(prospect.heightInInches || prospect.weight) && (
            <span className='truncate'>
              {prospect.heightInInches && formatHeight(prospect.heightInInches)}
              {prospect.heightInInches && prospect.weight && ' / '}
              {prospect.weight && `${prospect.weight} lbs`}
            </span>
          )}

          {/* Stats */}
          {(prospect.ppg || prospect.rpg || prospect.apg) && (
            <>
              <span className='text-muted-foreground/40 hidden md:inline'>·</span>
              <span className='hidden md:flex items-center gap-1.5 tabular-nums'>
                {prospect.ppg !== null && prospect.ppg !== undefined && (
                  <span><span className='text-purple-600 dark:text-purple-400 font-medium'>{Number(prospect.ppg).toFixed(1)}</span> PPG</span>
                )}
                {prospect.rpg !== null && prospect.rpg !== undefined && (
                  <span><span className='text-purple-600 dark:text-purple-400 font-medium'>{Number(prospect.rpg).toFixed(1)}</span> RPG</span>
                )}
                {prospect.apg !== null && prospect.apg !== undefined && (
                  <span><span className='text-purple-600 dark:text-purple-400 font-medium'>{Number(prospect.apg).toFixed(1)}</span> APG</span>
                )}
              </span>
            </>
          )}

          {/* Location & School */}
          {(location || prospect.highSchool) && (
            <>
              <span className='text-muted-foreground/40 hidden lg:inline'>·</span>
              <span className='hidden lg:flex items-center gap-1.5 truncate'>
                <MapPin className='w-3 h-3 shrink-0' />
                <span className='truncate'>
                  {location}
                  {location && prospect.highSchool && ' — '}
                  {prospect.highSchool}
                </span>
              </span>
            </>
          )}

        </div>
      </div>

      {/* Action Button */}
      {action && (
        <div className='shrink-0 self-center'>
          {action}
        </div>
      )}
    </div>
  )
}
