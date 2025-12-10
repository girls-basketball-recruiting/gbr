import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { ReactNode } from 'react'

interface Player {
  id: number
  firstName: string
  lastName: string
  graduationYear: number
  primaryPosition?: string
  highSchool?: string
  city?: string
  state?: string
  weightedGpa?: number
  unweightedGpa?: number
  bio?: string
}

interface PlayerCardProps {
  player: Player
  action?: ReactNode
}

export function PlayerCard({ player, action }: PlayerCardProps) {
  return (
    <Card className='bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors'>
      <div className='p-6 space-y-4'>
        <div className='flex items-start justify-between'>
          <div>
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
          <Button className='flex-1 bg-blue-600 hover:bg-blue-700' asChild>
            <Link href={`/players/${player.id}`}>View Profile</Link>
          </Button>
          {action}
        </div>
      </div>
    </Card>
  )
}
