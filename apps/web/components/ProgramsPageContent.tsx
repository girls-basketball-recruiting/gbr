'use client'

import { ListPageToolbar } from './ListPageToolbar'
import { ProgramCard } from './ui/ProgramCard'
import { ProgramsTable } from './ProgramsTable'
import { EmptyState } from './ui/EmptyState'
import { URLPagination } from './URLPagination'
import { ProgramSortSelector } from './ProgramSortSelector'
import { useViewPreference } from '@/hooks/useViewPreference'

interface ProgramsPageContentProps {
  programs: any[]
  totalDocs: number
  totalPages: number
  currentPage: number
  savedProgramIds?: Set<number>
  isPlayer?: boolean
}

export function ProgramsPageContent({
  programs,
  totalDocs,
  totalPages,
  currentPage,
  savedProgramIds = new Set(),
  isPlayer = false,
}: ProgramsPageContentProps) {
  const { view, handleViewChange } = useViewPreference('programs', 'grid')

  // Convert Set to object for client component
  const savedIds = Array.from(savedProgramIds)

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
        <ProgramsTable programs={programs} savedProgramIds={savedProgramIds} isPlayer={isPlayer} />
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              isSaved={savedIds.includes(program.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='mt-8'>
          <URLPagination
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </>
  )
}
