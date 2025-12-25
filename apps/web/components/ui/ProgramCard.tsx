import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { BadgeCheck, MapPin, Building2, GraduationCap } from 'lucide-react'
import { divisionLabels } from '@/lib/zod/LevelsOfPlay'

interface Program {
  id: number
  school: string
  city: string
  state: string
  type: 'public' | 'private'
  conference: string
  division: 'd1' | 'd2' | 'd3' | 'naia' | 'juco' | 'other'
  hasCoach?: boolean
}

interface ProgramCardProps {
  program: Program
}

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Card
      className={`min-w-72 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all ${
        program.hasCoach
          ? 'ring-2 ring-blue-500/30 border-blue-500/50 dark:border-blue-500/50'
          : ''
      }`}
    >
      <div className='p-6 space-y-4'>
        {/* Header with badge if has coach */}
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1'>
            <h3 className='text-xl font-semibold text-slate-900 dark:text-white leading-tight'>
              {program.school}
            </h3>
          </div>
          {program.hasCoach && (
            <div className='flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-600/20 border border-blue-500/50 rounded-full'>
              <BadgeCheck className='w-4 h-4 text-blue-600 dark:text-blue-400' />
              <span className='text-xs font-medium text-blue-700 dark:text-blue-400'>
                Coach on Platform
              </span>
            </div>
          )}
        </div>

        {/* Program Details */}
        <div className='space-y-2 text-sm'>
          <div className='flex items-center gap-2 text-slate-700 dark:text-slate-300'>
            <MapPin className='w-4 h-4 text-slate-500 dark:text-slate-400' />
            <span>
              {program.city}, {program.state}
            </span>
          </div>

          <div className='flex items-center gap-2 text-slate-700 dark:text-slate-300'>
            <GraduationCap className='w-4 h-4 text-slate-500 dark:text-slate-400' />
            <span>{divisionLabels[program.division] || program.division}</span>
          </div>

          <div className='flex items-center gap-2 text-slate-700 dark:text-slate-300'>
            <Building2 className='w-4 h-4 text-slate-500 dark:text-slate-400' />
            <span className='capitalize'>{program.type}</span>
          </div>

          {program.conference && (
            <div className='text-slate-600 dark:text-slate-400 text-xs'>
              {program.conference}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className='pt-2'>
          <Button
            className={`w-full ${
              program.hasCoach
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-slate-600 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600'
            }`}
            asChild
          >
            <Link href={`/programs/${program.id}`}>
              {program.hasCoach ? 'View Program & Coach' : 'View Program'}
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
