import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import Image from 'next/image'
import { ReactNode } from 'react'

interface Player {
  id: number
  firstName: string
  lastName: string
  graduationYear: number
  primaryPosition?: string | null
  highSchool?: string | null
  city?: string | null
  state?: string | null
  weightedGpa?: number | null
  unweightedGpa?: number | null
  bio?: string | null
  deletedAt?: string | null
  profileImage?: {
    url?: string | null
    alt?: string | null
  } | number | null
}

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

  return (
    <Card className={`bg-slate-800/50 border-slate-700 transition-colors ${
      isArchived
        ? 'opacity-60 border-orange-600/50'
        : 'hover:border-slate-600'
    }`}>
      <div className='p-6 space-y-4'>
        {isArchived && (
          <div className='bg-orange-600/20 border border-orange-600/50 rounded px-3 py-2 text-sm text-orange-300'>
            ⚠️ This player profile has been removed
          </div>
        )}
        <div className='flex items-start gap-4'>
          {/* Profile Image */}
          {profileImageUrl && (
            <div className='w-16 h-16 rounded-full overflow-hidden bg-slate-700 relative flex-shrink-0'>
              <Image
                src={profileImageUrl}
                alt={`${player.firstName} ${player.lastName}`}
                fill
                className='object-cover'
              />
            </div>
          )}

          {/* Player Info */}
          <div className='flex-1 min-w-0'>
            <h4 className='text-xl font-semibold text-white'>
              {player.firstName} {player.lastName}
            </h4>
            <p className='text-slate-400 text-sm'>
              Class of {player.graduationYear}
            </p>
          </div>
        </div>

        <div className='space-y-2 text-sm'>
          {player.primaryPosition && (
            <div className='flex items-center gap-2'>
              <span className='text-slate-400'>Position:</span>
              <span className='text-white capitalize'>
                {player.primaryPosition.replace('-', ' ')}
              </span>
            </div>
          )}
          {player.highSchool && (
            <div className='flex items-center gap-2'>
              <span className='text-slate-400'>School:</span>
              <span className='text-white'>{player.highSchool}</span>
            </div>
          )}
          {player.city && player.state && (
            <div className='flex items-center gap-2'>
              <span className='text-slate-400'>Location:</span>
              <span className='text-white'>
                {player.city}, {player.state}
              </span>
            </div>
          )}
          {(player.weightedGpa || player.unweightedGpa) && (
            <div className='flex items-center gap-2'>
              <span className='text-slate-400'>GPA:</span>
              <span className='text-white'>
                {player.weightedGpa || player.unweightedGpa}
              </span>
            </div>
          )}
        </div>

        {player.bio && (
          <p className='text-slate-300 text-sm line-clamp-3'>{player.bio}</p>
        )}

        <div className='pt-4 flex gap-2'>
          {isArchived ? (
            <Button
              className='flex-1 bg-slate-600 cursor-not-allowed'
              disabled
            >
              Profile Unavailable
            </Button>
          ) : (
            <Button className='flex-1 bg-blue-600 hover:bg-blue-700' asChild>
              <Link href={`/players/${player.id}`}>View Profile</Link>
            </Button>
          )}
          {action}
        </div>
      </div>
    </Card>
  )
}
