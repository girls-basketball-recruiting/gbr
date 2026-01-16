import { Card } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import Image from 'next/image'
import { ReactNode } from 'react'
import { getPositionLabel } from '@/lib/zod/Positions'
import { formatHeight } from '@/lib/formatters'
import type { Player } from '@/payload-types'
import { ButtonLink } from './ButtonLink'
import { User } from 'lucide-react'

interface PlayerCardProps {
  player: Player
  action?: ReactNode
  isOwnCard?: boolean
}

export function PlayerCard({ player, action, isOwnCard = false }: PlayerCardProps) {
  if (!player) return null

  const profileImageUrl = player.profileImageUrl
  const isArchived = !!player.deletedAt
  const hasStats = player.ppg || player.rpg || player.apg

  return (
    <Card className={`overflow-hidden p-0 flex flex-col h-full transition-all ${
      isArchived ? 'opacity-60' : 'hover:shadow-xl hover:-translate-y-1'
    }`}>
      {/* Header Area - Orange theme for players */}
      <div className='relative aspect-[4/3] bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-b-3xl overflow-hidden'>
        {profileImageUrl ? (
          <Image
            src={profileImageUrl}
            alt={`${player.firstName} ${player.lastName}`}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            priority={false}
          />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='w-20 h-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30'>
              <User className='w-10 h-10 text-white/80' />
            </div>
          </div>
        )}

        {/* Own Profile Badge - Top Left */}
        {isOwnCard && (
          <div className='absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold tracking-wider text-white flex items-center gap-1.5'>
            <span className='text-amber-400'>★</span>
            <span>YOU</span>
          </div>
        )}

        {/* Graduation Year Badge - Top Right */}
        <div className='absolute top-3 right-3'>
          <Badge className='bg-black/60 backdrop-blur-sm border-0 text-white text-sm px-3 py-1 font-bold'>
            &apos;{String(player.graduationYear).slice(-2)}
          </Badge>
        </div>

        {isArchived && (
          <div className='absolute top-0 left-0 right-0 bg-red-600/90 px-3 py-2 text-xs font-bold text-center text-white'>
            ⚠️ ARCHIVED
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className='p-5 pt-0 flex flex-col flex-1'>
        {/* Name & Position */}
        <div className='mb-4'>
          <h3 className='text-lg font-bold tracking-tight'>
            {player.firstName} {player.lastName}
          </h3>
          {player.primaryPosition && (
            <p className='text-sm text-muted-foreground font-medium'>
              {getPositionLabel(player.primaryPosition)}
            </p>
          )}
        </div>

        {/* Stats Row */}
        {hasStats && (
          <div className='grid grid-cols-3 gap-2 rounded-xl p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 mb-4'>
            {player.ppg !== null && player.ppg !== undefined && (
              <div className='text-center'>
                <div className='text-lg font-bold text-orange-700 dark:text-orange-400'>
                  {player.ppg.toFixed(1)}
                </div>
                <div className='text-[10px] uppercase font-semibold text-orange-600/70 dark:text-orange-500/70'>
                  PPG
                </div>
              </div>
            )}
            {player.rpg !== null && player.rpg !== undefined && (
              <div className='text-center border-x border-orange-200 dark:border-orange-800'>
                <div className='text-lg font-bold text-orange-700 dark:text-orange-400'>
                  {player.rpg.toFixed(1)}
                </div>
                <div className='text-[10px] uppercase font-semibold text-orange-600/70 dark:text-orange-500/70'>
                  RPG
                </div>
              </div>
            )}
            {player.apg !== null && player.apg !== undefined && (
              <div className='text-center'>
                <div className='text-lg font-bold text-orange-700 dark:text-orange-400'>
                  {player.apg.toFixed(1)}
                </div>
                <div className='text-[10px] uppercase font-semibold text-orange-600/70 dark:text-orange-500/70'>
                  APG
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key Info Grid */}
        <div className='grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4'>
          {player.heightInInches && (
            <div>
              <div className='text-[10px] uppercase font-semibold text-muted-foreground tracking-wide'>
                Height
              </div>
              <div className='font-semibold'>{formatHeight(player.heightInInches)}</div>
            </div>
          )}
          {player.weight && (
            <div>
              <div className='text-[10px] uppercase font-semibold text-muted-foreground tracking-wide'>
                Weight
              </div>
              <div className='font-semibold'>{player.weight} lbs</div>
            </div>
          )}
          {(player.weightedGpa || player.unweightedGpa) && (
            <div>
              <div className='text-[10px] uppercase font-semibold text-muted-foreground tracking-wide'>
                GPA
              </div>
              <div className='font-semibold'>
                {player.weightedGpa || player.unweightedGpa}
              </div>
            </div>
          )}
          {player.highSchool && (
            <div className='col-span-2'>
              <div className='text-[10px] uppercase font-semibold text-muted-foreground tracking-wide'>
                School
              </div>
              <div className='font-medium truncate'>
                {player.highSchool}
              </div>
            </div>
          )}
          {(player.city || player.state) && (
            <div className='col-span-2'>
              <div className='text-[10px] uppercase font-semibold text-muted-foreground tracking-wide'>
                Location
              </div>
              <div className='font-medium truncate'>
                {player.city}
                {player.city && player.state && ', '}
                {player.state}
              </div>
            </div>
          )}
        </div>

        {/* Actions - pushed to bottom */}
        <div className='mt-auto pt-4 flex gap-2 border-t'>
          {isArchived ? (
            <button
              className='flex-1 px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed'
              disabled
            >
              Unavailable
            </button>
          ) : (
            <ButtonLink href={`/players/${player.id}`} variant='secondary' className='flex-1'>
              View Profile
            </ButtonLink>
          )}
          {action}
        </div>
      </div>
    </Card>
  )
}
