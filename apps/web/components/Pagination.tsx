'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@workspace/ui/components/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  if (totalPages <= 1) {
    return null
  }

  const goToPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString())

    if (page === 1) {
      newParams.delete('page')
    } else {
      newParams.set('page', page.toString())
    }

    startTransition(() => {
      router.push(`/players?${newParams.toString()}`)
    })

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []

    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className='flex items-center justify-center gap-2 mt-8'>
      <Button
        variant='outline'
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1 || isPending}
        className='border-slate-600 text-white hover:bg-slate-800'
      >
        Previous
      </Button>

      <div className='flex gap-1'>
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className='px-3 py-2 text-slate-400'
              >
                ...
              </span>
            )
          }

          const pageNumber = page as number

          return (
            <Button
              key={pageNumber}
              variant={pageNumber === currentPage ? 'default' : 'outline'}
              onClick={() => goToPage(pageNumber)}
              disabled={isPending}
              className={
                pageNumber === currentPage
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'border-slate-600 text-white hover:bg-slate-800'
              }
            >
              {pageNumber}
            </Button>
          )
        })}
      </div>

      <Button
        variant='outline'
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages || isPending}
        className='border-slate-600 text-white hover:bg-slate-800'
      >
        Next
      </Button>
    </div>
  )
}
