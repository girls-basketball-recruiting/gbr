'use client'

import { ListPageToolbar } from './ListPageToolbar'
import { ProspectSortDropdown } from './ProspectSortDropdown'
import { ProfileCard } from './ui/ProfileCard'
import { ProspectsTable } from './ProspectsTable'
import { EmptyState } from './ui/EmptyState'
import { URLPagination } from './URLPagination'
import { useViewPreference } from '@/hooks/useViewPreference'
import { ButtonLink } from './ui/ButtonLink'
import { Plus, Upload } from 'lucide-react'
import type { CoachProspect } from '@/payload-types'

interface ProspectsPageContentProps {
  prospects: CoachProspect[]
  totalDocs: number
  totalPages: number
  currentPage: number
}

export function ProspectsPageContent({
  prospects,
  totalDocs,
  totalPages,
  currentPage,
}: ProspectsPageContentProps) {
  const { view, handleViewChange } = useViewPreference('prospects', 'grid')

  return (
    <>
      {/* Toolbar */}
      <ListPageToolbar
        totalCount={totalDocs}
        itemLabel='prospect'
        view={view}
        onViewChange={handleViewChange}
        sortSelector={<ProspectSortDropdown />}
      />

      {/* Content */}
      {prospects.length === 0 ? (
        <EmptyState
          title='No Prospects Added Yet'
          description="Add prospects manually or import from CSV to track players who haven't registered on the platform yet."
          action={
            <div className='flex gap-3'>
              <ButtonLink href='/prospects/create' variant='default'>
                <Plus className='w-4 h-4 mr-2' />
                Add Prospect
              </ButtonLink>
              <ButtonLink href='/prospects/create?tab=import' variant='outline'>
                <Upload className='w-4 h-4 mr-2' />
                Import CSV
              </ButtonLink>
            </div>
          }
        />
      ) : view === 'table' ? (
        <ProspectsTable prospects={prospects} />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6'>
          {prospects.map((prospect) => (
            <ProfileCard
              key={prospect.id}
              profile={prospect}
              variant='prospect'
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
