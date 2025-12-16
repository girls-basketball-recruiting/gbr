'use client'

import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

interface ViewToggleProps {
  view: 'grid' | 'table'
  onViewChange: (view: 'grid' | 'table') => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className='flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1'>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => onViewChange('grid')}
        className={cn(
          'h-8 w-8 p-0',
          view === 'grid'
            ? 'bg-white dark:bg-slate-700 shadow-sm'
            : 'hover:bg-slate-200 dark:hover:bg-slate-700',
        )}
        aria-label='Grid view'
      >
        <LayoutGrid className='w-4 h-4' />
      </Button>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => onViewChange('table')}
        className={cn(
          'h-8 w-8 p-0',
          view === 'table'
            ? 'bg-white dark:bg-slate-700 shadow-sm'
            : 'hover:bg-slate-200 dark:hover:bg-slate-700',
        )}
        aria-label='Table view'
      >
        <List className='w-4 h-4' />
      </Button>
    </div>
  )
}
