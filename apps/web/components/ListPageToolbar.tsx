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
    <div className='flex items-center justify-between mb-6'>
      <MutedText className=''>
        {totalCount.toLocaleString()} {itemLabel}
        {totalCount !== 1 && 's'}
      </MutedText>
      <div className='flex items-center gap-3'>
        <PageSizeSelector />
        {sortSelector}
        <ViewToggle view={view} onViewChange={onViewChange} />
      </div>
    </div>
  )
}
