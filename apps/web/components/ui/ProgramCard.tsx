'use client'

import { Badge } from '@workspace/ui/components/badge'
import { Card } from '@workspace/ui/components/card'
import { MapPin, Building2, GraduationCap, Bookmark, School } from 'lucide-react'
import { divisionLabels } from '@/lib/zod/LevelsOfPlay'
import Link from 'next/link'

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
    <Link href={`/programs/${program.id}`} className='block h-full'>
      <Card className={`overflow-hidden p-0 flex flex-col h-full transition-all hover:shadow-xl hover:-translate-y-1 ${
        coachCount > 0 ? 'ring-2 ring-blue-500/50' : ''
      }`}>
        {/* Header Area - Blue theme for programs */}
        <div className='relative aspect-[16/9] bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-b-3xl overflow-hidden'>
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='w-20 h-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30'>
              <School className='w-10 h-10 text-white/80' />
            </div>
          </div>

          {/* Division Badge - Top Right */}
          <div className='absolute top-3 right-3'>
            <Badge className='bg-black/60 backdrop-blur-sm border-0 text-white text-sm px-3 py-1 font-bold'>
              {divisionLabels[program.division] || program.division}
            </Badge>
          </div>

          {/* Saved Indicator - Top Left */}
          {isSaved && (
            <div className='absolute top-3 left-3 bg-black/60 backdrop-blur-sm p-2 rounded-full'>
              <Bookmark className='w-4 h-4 text-blue-400 fill-blue-400' />
            </div>
          )}

          {/* Coach Count Badge */}
          {coachCount > 0 && (
            <div className='absolute bottom-3 right-3'>
              <Badge className='bg-blue-700 border-0 text-white text-xs px-2 py-1'>
                {coachCount} {coachCount === 1 ? 'Coach' : 'Coaches'} on Platform
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className='p-5 pt-0 flex flex-col flex-1'>
          {/* School Name */}
          <div className='mb-4'>
            <h3 className='text-lg font-bold tracking-tight line-clamp-2'>
              {program.school}
            </h3>
            {program.conference && (
              <p className='text-sm text-muted-foreground font-medium mt-1'>
                {program.conference}
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className='space-y-2 text-sm mb-4'>
            <div className='flex items-center gap-2 text-muted-foreground'>
              <MapPin className='w-4 h-4 text-blue-500' />
              <span>{program.city}, {program.state}</span>
            </div>

            <div className='flex items-center gap-2 text-muted-foreground'>
              <Building2 className='w-4 h-4 text-blue-500' />
              <span className='capitalize'>{program.type}</span>
            </div>

            <div className='flex items-center gap-2 text-muted-foreground'>
              <GraduationCap className='w-4 h-4 text-blue-500' />
              <span>{divisionLabels[program.division] || program.division}</span>
            </div>
          </div>

          {/* View indicator - pushed to bottom */}
          <div className='mt-auto pt-4 border-t'>
            <div className='text-sm font-medium text-blue-600 dark:text-blue-400'>
              View Program →
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
