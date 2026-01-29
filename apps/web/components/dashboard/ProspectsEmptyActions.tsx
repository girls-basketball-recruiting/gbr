'use client'

import { ButtonLink } from '@/components/ui/ButtonLink'
import { ProspectCsvUpload } from '@/components/ProspectCsvUpload'

export function ProspectsEmptyActions() {
  return (
    <div className='flex flex-col sm:flex-row justify-center items-center gap-3'>
      <ButtonLink href='/prospects/create' variant='secondary' size='sm'>
        + Add Prospect
      </ButtonLink>
      <ProspectCsvUpload />
    </div>
  )
}
