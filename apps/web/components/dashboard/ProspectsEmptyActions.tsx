'use client'

import { ButtonLink } from '@/components/ui/ButtonLink'
import { ProspectCsvUpload } from '@/components/ProspectCsvUpload'

export function ProspectsEmptyActions() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <ButtonLink href="/prospects/create" variant="secondary">
        + Add Prospect
      </ButtonLink>
      <span className="text-sm text-slate-500">or</span>
      <ProspectCsvUpload />
    </div>
  )
}
