import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import Link from 'next/link'
import Image from 'next/image'
import { ReactNode } from 'react'
import { getPositionLabel } from '@/types/positions'
import type { Player } from '@/payload-types'

interface PlayerCardProps {
  player: Player
  action?: ReactNode
}

export function PlayerCard({ player, action }: PlayerCardProps) {
  const profileImageUrl =
    player.profileImage && typeof player.profileImage === 'object'
      ? player.profileImage.url
      : null

  const isArchived = !!player.deletedAt

  const hasStats = player.ppg || player.rpg || player.apg

  return (
    <Card
      className={`overflow-hidden pt-0 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 transition-all ${
        isArchived
          ? 'opacity-60 border-orange-600/50 dark:border-orange-600/50'
          : 'hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl'
      }`}
    >
      {/* Square Image */}
      <div className='relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800'>
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
            <span className='text-7xl font-bold text-slate-400 dark:text-slate-600'>
              {player.firstName?.[0]}
              {player.lastName?.[0]}
            </span>
          </div>
        )}

        {/* Graduation Year Badge */}
        <div className='absolute top-3 right-3'>
          <Badge className='bg-blue-600 hover:bg-blue-600 text-white border-0 shadow-xl text-base px-3 py-1 font-bold'>
            '{String(player.graduationYear).slice(-2)}
          </Badge>
        </div>

        {isArchived && (
          <div className='absolute top-0 left-0 right-0 bg-orange-600 text-white px-3 py-2 text-xs font-bold text-center'>
            ⚠️ ARCHIVED
          </div>
        )}

        {/* Bottom Gradient Overlay for Name */}
        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4'>
          <h3 className='text-xl font-bold text-white uppercase tracking-wide drop-shadow-lg'>
            {player.firstName} {player.lastName}
          </h3>
          {player.primaryPosition && (
            <p className='text-sm text-blue-300 font-semibold mt-0.5'>
              {getPositionLabel(player.primaryPosition)}
            </p>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className='p-4 space-y-3'>
        {/* Stats Row */}
        {hasStats && (
          <div className='grid grid-cols-3 gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg p-3 border border-blue-200 dark:border-blue-800'>
            {player.ppg !== null && player.ppg !== undefined && (
              <div className='text-center'>
                <div className='text-xl font-bold text-slate-900 dark:text-white'>
                  {player.ppg.toFixed(1)}
                </div>
                <div className='text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold'>
                  PPG
                </div>
              </div>
            )}
            {player.rpg !== null && player.rpg !== undefined && (
              <div className='text-center border-x border-blue-200 dark:border-blue-800'>
                <div className='text-xl font-bold text-slate-900 dark:text-white'>
                  {player.rpg.toFixed(1)}
                </div>
                <div className='text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold'>
                  RPG
                </div>
              </div>
            )}
            {player.apg !== null && player.apg !== undefined && (
              <div className='text-center'>
                <div className='text-xl font-bold text-slate-900 dark:text-white'>
                  {player.apg.toFixed(1)}
                </div>
                <div className='text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold'>
                  APG
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key Info - Grid Layout */}
        <div className='grid grid-cols-2 gap-x-3 gap-y-2 text-xs'>
          {player.height && (
            <div>
              <div className='text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wide mb-0.5'>
                Height
              </div>
              <div className='text-slate-900 dark:text-white font-bold'>{player.height}</div>
            </div>
          )}
          {(player.weightedGpa || player.unweightedGpa) && (
            <div>
              <div className='text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wide mb-0.5'>
                GPA
              </div>
              <div className='text-slate-900 dark:text-white font-bold'>
                {player.weightedGpa || player.unweightedGpa}
              </div>
            </div>
          )}
          {player.highSchool && (
            <div className='col-span-2'>
              <div className='text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wide mb-0.5'>
                School
              </div>
              <div className='text-slate-900 dark:text-white font-medium truncate'>
                {player.highSchool}
              </div>
            </div>
          )}
          {(player.city || player.state) && (
            <div className='col-span-2'>
              <div className='text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wide mb-0.5'>
                Location
              </div>
              <div className='text-slate-900 dark:text-white font-medium truncate'>
                {player.city}
                {player.city && player.state && ', '}
                {player.state}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className='pt-2 flex gap-2 border-t border-slate-200 dark:border-slate-700'>
          {isArchived ? (
            <Button
              className='flex-1 bg-slate-400 dark:bg-slate-600 cursor-not-allowed text-sm h-10'
              disabled
            >
              Unavailable
            </Button>
          ) : (
            <Button className='flex-1 bg-blue-600 hover:bg-blue-700 text-sm h-10 font-semibold' asChild>
              <Link href={`/players/${player.id}`}>View Profile</Link>
            </Button>
          )}
          {action}
        </div>
      </div>
    </Card>
  )
}
