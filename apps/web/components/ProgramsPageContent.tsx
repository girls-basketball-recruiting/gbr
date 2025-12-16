'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ListPageToolbar } from './ListPageToolbar'
import { ProgramCard } from './ui/ProgramCard'
import { ProgramsTable } from './ProgramsTable'
import { EmptyState } from './ui/EmptyState'
import { Pagination } from './Pagination'
import { ProgramSortSelector } from './ProgramSortSelector'

interface ProgramsPageContentProps {
  programs: any[]
  totalDocs: number
  totalPages: number
  currentPage: number
  initialView?: 'grid' | 'table'
}

export function ProgramsPageContent({
  programs,
  totalDocs,
  totalPages,
  currentPage,
  initialView = 'grid',
}: ProgramsPageContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = (searchParams.get('view') as 'grid' | 'table') || initialView

  const handleViewChange = (newView: 'grid' | 'table') => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', newView)
    router.push(`/programs?${params.toString()}`)
  }

  return (
    <>
      {/* Toolbar */}
      <ListPageToolbar
        totalCount={totalDocs}
        itemLabel="college women's basketball program"
        view={view}
        onViewChange={handleViewChange}
        sortSelector={<ProgramSortSelector />}
      />

      {/* Content */}
      {programs.length === 0 ? (
        <EmptyState
          title='No Programs Found'
          description='Try adjusting your filters to see more results.'
        />
      ) : view === 'table' ? (
        <ProgramsTable programs={programs} />
      ) : (
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='mt-8'>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </>
  )
}
