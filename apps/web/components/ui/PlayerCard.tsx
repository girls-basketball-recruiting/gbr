import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import Image from 'next/image'
import { ReactNode } from 'react'
import { getPositionLabel } from '@/lib/zod/Positions'
import { formatHeight } from '@/lib/formatters'
import type { Player } from '@/payload-types'
import { ButtonLink } from './ButtonLink'

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
    <Card
      className={`overflow-hidden pt-0 transition-all relative ${
        isArchived
          ? 'opacity-60'
          : 'hover:shadow-xl'
      }`}
    >
        {/* Square Image */}
        <div className='relative aspect-square'>
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
              <span className='text-7xl font-bold'>
                {player.firstName?.[0]}
                {player.lastName?.[0]}
              </span>
            </div>
          )}

          {/* Own Profile Badge - Top Left */}
          {isOwnCard && (
            <div className='absolute top-0 left-0 px-4 py-2 text-xs font-black tracking-wider shadow-lg flex items-center gap-1.5'>
              <span className='text-sm'>★</span>
              <span>YOU</span>
            </div>
          )}

          {/* Graduation Year Badge */}
          <div className='absolute top-3 right-3'>
            <Badge className='border-0 shadow-xl text-base px-3 py-1 font-bold'>
              &apos;{String(player.graduationYear).slice(-2)}
            </Badge>
          </div>

          {isArchived && (
            <div className='absolute top-0 left-0 right-0 px-3 py-2 text-xs font-bold text-center'>
              ⚠️ ARCHIVED
            </div>
          )}

        {/* Bottom Gradient Overlay for Name */}
        <div className='absolute bottom-0 left-0 right-0 p-4'>
          <h3 className='text-xl font-bold uppercase tracking-wide drop-shadow-lg'>
            {player.firstName} {player.lastName}
          </h3>
          {player.primaryPosition && (
            <p className='text-sm font-semibold mt-0.5'>
              {getPositionLabel(player.primaryPosition)}
            </p>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className='p-4 space-y-3'>
        {/* Stats Row */}
        {hasStats && (
          <div className='grid grid-cols-3 gap-2 rounded-lg p-3 border'>
            {player.ppg !== null && player.ppg !== undefined && (
              <div className='text-center'>
                <div className='text-xl font-bold'>
                  {player.ppg.toFixed(1)}
                </div>
                <div className='text-xs uppercase font-semibold'>
                  PPG
                </div>
              </div>
            )}
            {player.rpg !== null && player.rpg !== undefined && (
              <div className='text-center border-x'>
                <div className='text-xl font-bold'>
                  {player.rpg.toFixed(1)}
                </div>
                <div className='text-xs uppercase font-semibold'>
                  RPG
                </div>
              </div>
            )}
            {player.apg !== null && player.apg !== undefined && (
              <div className='text-center'>
                <div className='text-xl font-bold'>
                  {player.apg.toFixed(1)}
                </div>
                <div className='text-xs uppercase font-semibold'>
                  APG
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key Info - Grid Layout */}
        <div className='grid grid-cols-2 gap-x-3 gap-y-2 text-xs'>
          {player.heightInInches && (
            <div>
              <div className='uppercase text-[10px] font-semibold tracking-wide mb-0.5'>
                Height
              </div>
              <div className='font-bold'>{formatHeight(player.heightInInches)}</div>
            </div>
          )}
          {player.weight && (
            <div>
              <div className='uppercase text-[10px] font-semibold tracking-wide mb-0.5'>
                Weight
              </div>
              <div className='font-bold'>{player.weight} lbs</div>
            </div>
          )}
          {(player.weightedGpa || player.unweightedGpa) && (
            <div>
              <div className='uppercase text-[10px] font-semibold tracking-wide mb-0.5'>
                GPA
              </div>
              <div className='font-bold'>
                {player.weightedGpa || player.unweightedGpa}
              </div>
            </div>
          )}
          {player.highSchool && (
            <div className='col-span-2'>
              <div className='uppercase text-[10px] font-semibold tracking-wide mb-0.5'>
                School
              </div>
              <div className='font-medium truncate'>
                {player.highSchool}
              </div>
            </div>
          )}
          {(player.city || player.state) && (
            <div className='col-span-2'>
              <div className='uppercase text-[10px] font-semibold tracking-wide mb-0.5'>
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

        {/* Actions */}
        <div className='pt-2 flex gap-2 border-t'>
          {isArchived ? (
            <Button
              className='flex-1 cursor-not-allowed text-sm h-10'
              disabled
            >
              Unavailable
            </Button>
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
