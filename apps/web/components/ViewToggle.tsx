'use client'

import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { ButtonGroup } from '@workspace/ui/components/button-group'
import { cn } from '@workspace/ui/lib/utils'

interface ViewToggleProps {
  view: 'grid' | 'table'
  onViewChange: (view: 'grid' | 'table') => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <ButtonGroup>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onViewChange('grid')}
        className={cn(
          'h-8 w-8 p-0',
          view === 'grid' && 'bg-accent dark:bg-accent'
        )}
        aria-label='Grid view'
      >
        <LayoutGrid className='w-4 h-4' />
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onViewChange('table')}
        className={cn(
          'h-8 w-8 p-0',
          view === 'table' && 'bg-accent dark:bg-accent'
        )}
        aria-label='Table view'
      >
        <List className='w-4 h-4' />
      </Button>
    </ButtonGroup>
  )
}
