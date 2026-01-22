'use client'

import { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { User, MapPin } from 'lucide-react'
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
        {/* Row 1: Name / Position / Year + Badges */}
        <div className='flex items-center gap-2 min-w-0'>
          <div className='flex items-center gap-2 min-w-0 truncate'>
            <Link
              href={profileLink}
              className='font-semibold text-purple-600 dark:text-purple-400 hover:underline truncate'
            >
              {prospect.firstName} {prospect.lastName}
            </Link>
            {prospect.primaryPosition && (
              <>
                <span className='text-muted-foreground/40 hidden sm:inline'>/</span>
                <span className='text-sm text-muted-foreground truncate hidden sm:inline'>
                  {getPositionLabel(prospect.primaryPosition)}
                </span>
              </>
            )}
          </div>
          {prospect.graduationYear && (
            <Badge variant='secondary' className='text-[10px] px-1.5 py-0 h-5 shrink-0'>
              &apos;{String(prospect.graduationYear).slice(-2)}
            </Badge>
          )}
          <Badge className='bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 text-[10px] px-1.5 py-0 h-5 shrink-0'>
            PROSPECT
          </Badge>
        </div>

        {/* Row 2: Physical / Stats / Location / School */}
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
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
