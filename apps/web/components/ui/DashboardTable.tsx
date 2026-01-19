'use client'

import { useState, ReactNode, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

interface DashboardTableProps<T> {
  items: T[]
  renderRow: (item: T, index: number) => ReactNode
  emptyState: ReactNode
  pageSize?: number
  className?: string
}

export function DashboardTable<T>({
  items,
  renderRow,
  emptyState,
  pageSize = 10,
  className = ''
}: DashboardTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / pageSize)

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, currentPage, pageSize])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  if (items.length === 0) {
    return <>{emptyState}</>
  }

  return (
    <div className={className}>
      {/* Table Container */}
      <div className='rounded-xl border border-border/60 bg-card overflow-hidden'>
        {/* List Items */}
        <div className='divide-y divide-border/40'>
          {paginatedItems.map((item, index) => renderRow(item, index))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between mt-4 px-1'>
          <p className='text-sm text-muted-foreground tabular-nums'>
            Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, items.length)} of {items.length}
          </p>

          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className='h-8 w-8 p-0'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>

            {/* Page Numbers */}
            <div className='flex items-center gap-0.5'>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first, last, and pages around current
                  if (page === 1 || page === totalPages) return true
                  if (Math.abs(page - currentPage) <= 1) return true
                  return false
                })
                .map((page, idx, arr) => {
                  // Add ellipsis indicator
                  const showEllipsisBefore = idx > 0 && arr[idx - 1] !== page - 1
                  return (
                    <div key={page} className='flex items-center'>
                      {showEllipsisBefore && (
                        <span className='px-1 text-muted-foreground text-sm'>…</span>
                      )}
                      <Button
                        variant={currentPage === page ? 'secondary' : 'ghost'}
                        size='sm'
                        onClick={() => goToPage(page)}
                        className='h-8 w-8 p-0 text-sm tabular-nums'
                      >
                        {page}
                      </Button>
                    </div>
                  )
                })}
            </div>

            <Button
              variant='ghost'
              size='sm'
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className='h-8 w-8 p-0'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
