'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@workspace/ui/components/pagination'

interface URLPaginationProps {
  currentPage: number
  totalPages: number
}

export function URLPagination({ currentPage, totalPages }: URLPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  if (totalPages <= 1) {
    return null
  }

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || isPending) {
      return
    }

    const newParams = new URLSearchParams(searchParams.toString())

    if (page === 1) {
      newParams.delete('page')
    } else {
      newParams.set('page', page.toString())
    }

    startTransition(() => {
      router.push(`${pathname}?${newParams.toString()}`)
    })

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
          className={isPending ? 'pointer-events-none opacity-50 cursor-pointer' : 'cursor-pointer'}
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
            className={isPending ? 'pointer-events-none opacity-50 cursor-pointer' : 'cursor-pointer'}
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
            className={isPending ? 'pointer-events-none opacity-50 cursor-pointer' : 'cursor-pointer'}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return pages
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => goToPage(currentPage - 1)}
            className={
              currentPage === 1 || isPending
                ? 'pointer-events-none opacity-50'
                : 'cursor-pointer'
            }
          />
        </PaginationItem>

        {renderPageNumbers()}

        <PaginationItem>
          <PaginationNext
            onClick={() => goToPage(currentPage + 1)}
            className={
              currentPage === totalPages || isPending
                ? 'pointer-events-none opacity-50'
                : 'cursor-pointer'
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
