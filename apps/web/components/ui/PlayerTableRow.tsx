'use client'

import { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { User, MapPin } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { getPositionLabel } from '@/lib/zod/Positions'
import { formatHeight } from '@/lib/formatters'
import type { Player } from '@/payload-types'

interface PlayerTableRowProps {
  player: Player
  action?: ReactNode
  isOwnProfile?: boolean
}

export function PlayerTableRow({ player, action, isOwnProfile = false }: PlayerTableRowProps) {
  const isArchived = !!player.deletedAt
  const profileLink = `/players/${player.id}`

  const hasLocation = player.city || player.state
  const location = hasLocation
    ? [player.city, player.state].filter(Boolean).join(', ')
    : null

  return (
    <Link
      href={profileLink}
      className={`group flex items-stretch gap-4 px-4 py-3 transition-colors ${
        isArchived
          ? 'opacity-50 cursor-not-allowed pointer-events-none'
          : 'hover:bg-muted/40'
      }`}
    >
      {/* Avatar */}
      <div className='flex-shrink-0 self-center'>
        <div className='relative w-14 h-14 rounded-lg overflow-hidden bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-800/60'>
          {player.profileImageUrl ? (
            <Image
              src={player.profileImageUrl}
              alt={`${player.firstName} ${player.lastName}`}
              fill
              className='object-cover'
              sizes='56px'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <User className='w-6 h-6 text-orange-400 dark:text-orange-500' />
            </div>
          )}
        </div>
      </div>

      {/* Content - Two Rows */}
      <div className='flex-1 min-w-0 flex flex-col justify-center gap-0.5'>
        {/* Row 1: Name, Position, Badges */}
        <div className='flex items-center gap-2 min-w-0'>
          <span className='font-semibold text-foreground truncate'>
            {player.firstName} {player.lastName}
          </span>
          {player.primaryPosition && (
            <span className='text-sm text-muted-foreground truncate hidden sm:inline'>
              · {getPositionLabel(player.primaryPosition)}
            </span>
          )}
          {isOwnProfile && (
            <Badge className='bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700 text-[10px] px-1.5 py-0 h-5 flex-shrink-0'>
              YOU
            </Badge>
          )}
          {player.graduationYear && (
            <Badge variant='secondary' className='text-[10px] px-1.5 py-0 h-5 flex-shrink-0'>
              '{String(player.graduationYear).slice(-2)}
            </Badge>
          )}
          {isArchived && (
            <Badge variant='destructive' className='text-[10px] px-1.5 py-0 h-5 flex-shrink-0'>
              ARCHIVED
            </Badge>
          )}
        </div>

        {/* Row 2: Stats & Location */}
        <div className='flex items-center gap-3 text-sm text-muted-foreground'>
          {/* Physical */}
          {(player.heightInInches || player.weight) && (
            <span className='truncate'>
              {player.heightInInches && formatHeight(player.heightInInches)}
              {player.heightInInches && player.weight && ' · '}
              {player.weight && `${player.weight} lbs`}
            </span>
          )}

          {/* Stats */}
          {(player.ppg || player.rpg || player.apg) && (
            <span className='hidden md:flex items-center gap-1.5 tabular-nums'>
              {player.ppg !== null && player.ppg !== undefined && (
                <span><span className='text-orange-600 dark:text-orange-400 font-medium'>{Number(player.ppg).toFixed(1)}</span> PPG</span>
              )}
              {player.rpg !== null && player.rpg !== undefined && (
                <span><span className='text-orange-600 dark:text-orange-400 font-medium'>{Number(player.rpg).toFixed(1)}</span> RPG</span>
              )}
              {player.apg !== null && player.apg !== undefined && (
                <span><span className='text-orange-600 dark:text-orange-400 font-medium'>{Number(player.apg).toFixed(1)}</span> APG</span>
              )}
            </span>
          )}

          {/* Location */}
          {location && (
            <span className='hidden lg:flex items-center gap-1 truncate'>
              <MapPin className='w-3 h-3 flex-shrink-0' />
              <span className='truncate'>{location}</span>
            </span>
          )}

          {/* School */}
          {player.highSchool && (
            <span className='hidden xl:block truncate max-w-[180px]'>
              {player.highSchool}
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      {action && (
        <div className='flex-shrink-0 self-center' onClick={(e) => e.preventDefault()}>
          {action}
        </div>
      )}
    </Link>
  )
}
