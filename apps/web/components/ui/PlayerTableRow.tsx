'use client'

import { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { User, MapPin } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { getPositionLabel } from '@/lib/zod/Positions'
import { getAAUCircuitLabel } from '@/lib/zod/AauCircuits'
import { getAAUAgeBracketLabel } from '@/lib/zod/AauAgeBrackets'
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
    <div
      className={`group flex items-stretch gap-4 px-4 py-3 ${
        isArchived
          ? 'opacity-50 pointer-events-none'
          : ''
      }`}
    >
      {/* Avatar */}
      <div className='shrink-0 self-center'>
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
      <div className='flex-1 min-w-0 flex flex-col justify-center gap-1'>
        {/* Row 1: Name (full width on mobile) */}
        <div className='flex items-center gap-2 min-w-0'>
          <Link
            href={profileLink}
            className='font-semibold text-orange-600 dark:text-orange-400 hover:underline truncate'
          >
            {player.firstName} {player.lastName}
          </Link>
          {/* Position & Badges - visible on md+ */}
          {player.primaryPosition && (
            <span className='hidden md:flex items-center gap-2'>
              <span className='text-muted-foreground/40'>/</span>
              <span className='text-sm text-muted-foreground truncate'>
                {getPositionLabel(player.primaryPosition)}
              </span>
            </span>
          )}
          {player.graduationYear && (
            <Badge variant='secondary' className='hidden md:inline-flex text-[10px] px-1.5 py-0 h-5 shrink-0'>
              &apos;{String(player.graduationYear).slice(-2)}
            </Badge>
          )}
          {isOwnProfile && (
            <Badge className='hidden md:inline-flex bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700 text-[10px] px-1.5 py-0 h-5 shrink-0'>
              YOU
            </Badge>
          )}
          {isArchived && (
            <Badge variant='destructive' className='hidden md:inline-flex text-[10px] px-1.5 py-0 h-5 shrink-0'>
              ARCHIVED
            </Badge>
          )}
        </div>

        {/* Row 2 Mobile: Position / Year / Badges (mobile only) */}
        <div className='flex md:hidden items-center gap-2 flex-wrap'>
          {player.primaryPosition && (
            <span className='text-sm text-muted-foreground'>
              {getPositionLabel(player.primaryPosition)}
            </span>
          )}
          {player.graduationYear && (
            <Badge variant='secondary' className='text-[10px] px-1.5 py-0 h-5 shrink-0'>
              &apos;{String(player.graduationYear).slice(-2)}
            </Badge>
          )}
          {(player.heightInInches || player.weight) && (
            <span className='text-sm text-muted-foreground'>
              {player.heightInInches && formatHeight(player.heightInInches)}
              {player.heightInInches && player.weight && ' / '}
              {player.weight && `${player.weight} lbs`}
            </span>
          )}
          {isOwnProfile && (
            <Badge className='bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700 text-[10px] px-1.5 py-0 h-5 shrink-0'>
              YOU
            </Badge>
          )}
          {isArchived && (
            <Badge variant='destructive' className='text-[10px] px-1.5 py-0 h-5 shrink-0'>
              ARCHIVED
            </Badge>
          )}
        </div>

        {/* Row 2 Desktop: Physical / Stats / Location / School */}
        <div className='hidden md:flex items-center gap-2 text-sm text-muted-foreground'>
          {/* Physical */}
          {(player.heightInInches || player.weight) && (
            <span className='truncate'>
              {player.heightInInches && formatHeight(player.heightInInches)}
              {player.heightInInches && player.weight && ' / '}
              {player.weight && `${player.weight} lbs`}
            </span>
          )}

          {/* Stats */}
          {(player.ppg || player.rpg || player.apg) && (
            <>
              <span className='text-muted-foreground/40 hidden md:inline'>·</span>
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
            </>
          )}

          {/* Location & School */}
          {(location || player.highSchool) && (
            <>
              <span className='text-muted-foreground/40 hidden lg:inline'>·</span>
              <span className='hidden lg:flex items-center gap-1.5 truncate'>
                <MapPin className='w-3 h-3 shrink-0' />
                <span className='truncate'>
                  {location}
                  {location && player.highSchool && ' — '}
                  {player.highSchool}
                </span>
              </span>
            </>
          )}
        </div>

        {/* Row 3: AAU Info - Hidden on mobile */}
        {(() => {
          const circuit = getAAUCircuitLabel(player.aauCircuit)
          const team = player.aauProgramName
          const age = getAAUAgeBracketLabel(player.aauAgeBracket)

          if (!circuit && !team && !age) return null

          const parts: ReactNode[] = []

          if (circuit) {
            parts.push(
              <span key='circuit'>
                AAU Circuit: <span className='text-orange-600 dark:text-orange-400'>{circuit}</span>
              </span>
            )
          }

          if (team) {
            parts.push(
              <span key='team'>
                AAU Team: <span className='text-orange-600 dark:text-orange-400'>{team}</span>
                {age && <span> (<span className='text-orange-600 dark:text-orange-400'>{age}</span>)</span>}
              </span>
            )
          } else if (age) {
            parts.push(
              <span key='age'>
                AAU: <span className='text-orange-600 dark:text-orange-400'>{age}</span>
              </span>
            )
          }

          return (
            <div className='hidden md:flex text-sm text-muted-foreground items-center gap-1.5'>
              {parts.map((part, i) => (
                <span key={i} className='flex items-center gap-1.5'>
                  {i > 0 && <span className='text-muted-foreground/40'>•</span>}
                  {part}
                </span>
              ))}
            </div>
          )
        })()}
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
