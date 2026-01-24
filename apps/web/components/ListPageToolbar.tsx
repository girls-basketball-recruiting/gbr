'use client'

import { ReactNode } from 'react'
import { ViewToggle } from './ViewToggle'
import { PageSizeSelector } from './PageSizeSelector'
import { MutedText } from './ui/typography/MutedText'

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
    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6'>
      <MutedText className='text-sm'>
        {totalCount.toLocaleString()} {itemLabel}
        {totalCount !== 1 && 's'}
      </MutedText>
      <div className='flex items-center gap-2 sm:gap-3'>
        <PageSizeSelector />
        {sortSelector}
        <ViewToggle view={view} onViewChange={onViewChange} />
      </div>
    </div>
  )
}
