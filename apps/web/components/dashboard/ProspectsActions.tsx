'use client'

import { ButtonLink } from '@/components/ui/ButtonLink'
import { ProspectCsvUpload } from '@/components/ProspectCsvUpload'

export function ProspectsActions() {
  return (
    <div className="flex items-center gap-2">
      <ProspectCsvUpload />
      <ButtonLink href="/prospects/create" variant="ghost">
        + Add Prospect
      </ButtonLink>
    </div>
  )
}
