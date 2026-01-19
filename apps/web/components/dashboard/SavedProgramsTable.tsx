'use client'

import { DashboardTable } from '@/components/ui/DashboardTable'
import { ProgramTableRow } from '@/components/ui/ProgramTableRow'
import type { College } from '@/payload-types'

interface SavedProgramsTableProps {
  programs: College[]
}

export function SavedProgramsTable({ programs }: SavedProgramsTableProps) {
  return (
    <DashboardTable
      items={programs}
      pageSize={10}
      emptyState={null}
      renderRow={(program) => (
        <ProgramTableRow
          key={program.id}
          program={program}
          isSaved
        />
      )}
    />
  )
}
