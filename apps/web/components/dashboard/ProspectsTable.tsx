'use client'

import { DashboardTable } from '@/components/ui/DashboardTable'
import { ProspectTableRow } from '@/components/ui/ProspectTableRow'
import type { CoachProspect } from '@/payload-types'

interface ProspectsTableProps {
  prospects: CoachProspect[]
}

export function ProspectsTable({ prospects }: ProspectsTableProps) {
  return (
    <DashboardTable
      items={prospects}
      pageSize={10}
      emptyState={null}
      renderRow={(prospect) => (
        <ProspectTableRow
          key={prospect.id}
          prospect={prospect}
        />
      )}
    />
  )
}
