'use client'

import { Badge } from '@workspace/ui/components/badge'
import { Card } from '@workspace/ui/components/card'
import { BadgeCheck, MapPin, Building2, GraduationCap, Bookmark } from 'lucide-react'
import { divisionLabels } from '@/lib/zod/LevelsOfPlay'
import Link from 'next/link'
import { H4, P, Small } from './typography'

interface Program {
  id: number
  school: string
  city: string
  state: string
  type: 'public' | 'private'
  conference: string
  division: 'd1' | 'd2' | 'd3' | 'naia' | 'juco' | 'other'
  coachCount?: number
}

interface ProgramCardProps {
  program: Program
  isSaved?: boolean
}

export function ProgramCard({ program, isSaved = false }: ProgramCardProps) {
  const coachCount = program.coachCount ?? 0
  return (
    <Link href={`/programs/${program.id}`}>
      <Card
        className={`relative py-0 max-w-full w-90 hover:bg-accent ring-1 hover:ring-primary transition-all ${
          coachCount > 0
            ? 'ring-2 hover:ring-primary'
            : ''
        }`}
      >
        <div className='px-6 py-4'>
          <H4 className='truncate mb-2'>
            {program.school}
          </H4>

          {program.conference && (
            <P className='truncate mb-2'>
              <Small>{program.conference}</Small>
            </P>
          )}

          {/* Program Details */}
          <div className='space-y-2 text-sm'>
            <div className='flex items-center gap-2'>
              <MapPin className='w-4 h-4' />
              <span>
                {program.city}, {program.state}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <GraduationCap className='w-4 h-4' />
              <span>{divisionLabels[program.division] || program.division}</span>
            </div>

            <div className='flex items-center gap-2'>
              <Building2 className='w-4 h-4' />
              <span className='capitalize'>{program.type}</span>
            </div>
          </div>

          {isSaved && (
            <div className='absolute right-5 bottom-5'>
              <Bookmark className='text-primary w-6 h-6' />
            </div>
          )}
          {coachCount > 0 && (
            <Badge className={`h-6 absolute ${isSaved ? 'right-15' : 'right-5'} bottom-5`}>
              <BadgeCheck className='w-4 h-4' />
              <Small className='text-xs'>
                {program.coachCount} {program.coachCount === 1 ? 'Coach' : 'Coaches'}
              </Small>
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  )
}
