'use client'

import Link from 'next/link'
import { School, MapPin, Building2, Bookmark } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { divisionLabels } from '@/lib/zod/LevelsOfPlay'
import type { College } from '@/payload-types'

interface ProgramWithCoachCount extends College {
  coachCount?: number
}

interface ProgramTableRowProps {
  program: ProgramWithCoachCount
  isSaved?: boolean
}

export function ProgramTableRow({ program, isSaved = false }: ProgramTableRowProps) {
  const coachCount = program.coachCount ?? 0
  const profileLink = `/programs/${program.id}`

  return (
    <Link
      href={profileLink}
      className='group flex items-stretch gap-4 px-4 py-3 transition-colors hover:bg-muted/40'
    >
      {/* Icon */}
      <div className='flex-shrink-0 self-center'>
        <div className='relative w-14 h-14 rounded-lg overflow-hidden bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center'>
          <School className='w-6 h-6 text-blue-400 dark:text-blue-500' />
        </div>
      </div>

      {/* Content - Two Rows */}
      <div className='flex-1 min-w-0 flex flex-col justify-center gap-0.5'>
        {/* Row 1: School Name, Division, Badges */}
        <div className='flex items-center gap-2 min-w-0'>
          <span className='font-semibold text-foreground truncate'>
            {program.school}
          </span>
          {program.division && (
            <Badge className='bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-[10px] px-1.5 py-0 h-5 flex-shrink-0'>
              {divisionLabels[program.division] || program.division}
            </Badge>
          )}
          {isSaved && (
            <Bookmark className='w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0' />
          )}
          {coachCount > 0 && (
            <Badge variant='secondary' className='text-[10px] px-1.5 py-0 h-5 flex-shrink-0 hidden sm:flex'>
              {coachCount} {coachCount === 1 ? 'Coach' : 'Coaches'}
            </Badge>
          )}
        </div>

        {/* Row 2: Conference, Location, Type */}
        <div className='flex items-center gap-3 text-sm text-muted-foreground'>
          {/* Conference */}
          {program.conference && (
            <span className='truncate max-w-[200px]'>
              {program.conference}
            </span>
          )}

          {/* Location */}
          {(program.city || program.state) && (
            <span className='hidden md:flex items-center gap-1 truncate'>
              <MapPin className='w-3 h-3 flex-shrink-0' />
              <span className='truncate'>
                {program.city}
                {program.city && program.state && ', '}
                {program.state}
              </span>
            </span>
          )}

          {/* Type */}
          {program.type && (
            <span className='hidden lg:flex items-center gap-1'>
              <Building2 className='w-3 h-3 flex-shrink-0' />
              <span className='capitalize'>{program.type}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
