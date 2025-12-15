import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { ReactNode } from 'react'

interface Prospect {
  id: number | string
  name: string
  graduationYear: number
  uniformNumber?: string
  height?: string
  highSchool?: string
  aauProgram?: string
  twitterHandle?: string
  phoneNumber?: string
  notes?: string
}

interface ProspectCardProps {
  prospect: Prospect
  onEdit?: () => void
  onDelete?: () => void
  action?: ReactNode
}

export function ProspectCard({
  prospect,
  onEdit,
  onDelete,
  action,
}: ProspectCardProps) {
  return (
    <Card className='min-w-72 bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors'>
      <div className='p-6 space-y-4'>
        <div className='flex items-start justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <h4 className='text-xl font-semibold text-white'>
                {prospect.name}
              </h4>
              {prospect.uniformNumber && (
                <span className='text-sm text-slate-400'>
                  #{prospect.uniformNumber}
                </span>
              )}
            </div>
            <p className='text-slate-400 text-sm'>
              Class of {prospect.graduationYear}
            </p>
          </div>
          <span className='px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-md'>
            Manual Entry
          </span>
        </div>

        <div className='space-y-2 text-sm'>
          {prospect.height && (
            <div className='flex items-center gap-2'>
              <span className='text-slate-400'>Height:</span>
              <span className='text-white'>{prospect.height}</span>
            </div>
          )}
          {prospect.highSchool && (
            <div className='flex items-center gap-2'>
              <span className='text-slate-400'>School:</span>
              <span className='text-white'>{prospect.highSchool}</span>
            </div>
          )}
          {prospect.aauProgram && (
            <div className='flex items-center gap-2'>
              <span className='text-slate-400'>AAU:</span>
              <span className='text-white'>{prospect.aauProgram}</span>
            </div>
          )}
          {prospect.twitterHandle && (
            <div className='flex items-center gap-2'>
              <span className='text-slate-400'>Twitter:</span>
              <span className='text-white'>{prospect.twitterHandle}</span>
            </div>
          )}
          {prospect.phoneNumber && (
            <div className='flex items-center gap-2'>
              <span className='text-slate-400'>Phone:</span>
              <span className='text-white'>{prospect.phoneNumber}</span>
            </div>
          )}
        </div>

        {prospect.notes && (
          <p className='text-slate-300 text-sm line-clamp-3'>{prospect.notes}</p>
        )}

        <div className='pt-4 flex gap-2'>
          {onEdit && (
            <Button
              onClick={onEdit}
              className='flex-1 bg-slate-700 hover:bg-slate-600'
            >
              Edit
            </Button>
          )}
          {action}
        </div>
      </div>
    </Card>
  )
}
