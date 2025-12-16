'use client'

import { ReactNode } from 'react'
import { ViewToggle } from './ViewToggle'

interface ListPageToolbarProps {
  totalCount: number
  itemLabel: string
  view: 'grid' | 'table'
  onViewChange: (view: 'grid' | 'table') => void
  sortSelector?: ReactNode
}

export function ListPageToolbar({
  totalCount,
  itemLabel,
  view,
  onViewChange,
  sortSelector,
}: ListPageToolbarProps) {
  return (
    <div className='flex items-center justify-between mb-6'>
      <p className='text-slate-600 dark:text-slate-400'>
        {totalCount.toLocaleString()} {itemLabel}
        {totalCount !== 1 && 's'}
      </p>
      <div className='flex items-center gap-3'>
        {sortSelector}
        <ViewToggle view={view} onViewChange={onViewChange} />
      </div>
    </div>
  )
}
