'use client'

import { ButtonLink } from '@/components/ui/ButtonLink'
import { ProspectCsvUpload } from '@/components/ProspectCsvUpload'

export function ProspectsActions() {
  return (
    <div className='flex items-center gap-2'>
      <ButtonLink href='/prospects/create' variant='ghost' size='sm'>
        + Add Prospect
      </ButtonLink>
      <ProspectCsvUpload />
    </div>
  )
}
