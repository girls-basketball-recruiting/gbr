'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@workspace/ui/components/pagination'

interface Attendee {
  id: number
  name: string
  detail: string
  profileUrl: string
}

interface TournamentAttendeesTableProps {
  attendees: Attendee[]
}

const ITEMS_PER_PAGE = 10

export function TournamentAttendeesTable({ attendees }: TournamentAttendeesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(attendees.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentAttendees = attendees.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const renderPageNumbers = () => {
    const pages = []
    const showEllipsisStart = currentPage > 3
    const showEllipsisEnd = currentPage < totalPages - 2

    // Always show first page
    pages.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => goToPage(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    )

    // Show ellipsis if needed
    if (showEllipsisStart) {
      pages.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }

    // Show pages around current page
    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => goToPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    // Show ellipsis if needed
    if (showEllipsisEnd) {
      pages.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }

    // Always show last page if there's more than 1 page
    if (totalPages > 1) {
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => goToPage(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return pages
  }

  return (
    <div className='space-y-4'>
      {/* Table */}
      <div className='grid gap-3'>
        {currentAttendees.map((attendee) => (
          <Link
            key={attendee.id}
            href={attendee.profileUrl}
            className='block p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-semibold text-slate-900 dark:text-white'>
                  {attendee.name}
                </p>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  {attendee.detail}
                </p>
              </div>
              <span className='text-sm text-blue-600 dark:text-blue-400'>
                View Profile →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => goToPage(currentPage - 1)}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {renderPageNumbers()}

            <PaginationItem>
              <PaginationNext
                onClick={() => goToPage(currentPage + 1)}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
