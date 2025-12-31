'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

const PAGE_SIZE_OPTIONS = [
  { value: '12', label: '12' },
  { value: '24', label: '24' },
  { value: '48', label: '48' },
  { value: '96', label: '96' },
]

export function PageSizeSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPageSize = searchParams.get('pageSize') || '24'

  const handlePageSizeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('pageSize', value)
    params.set('page', '1') // Reset to first page when changing page size
    router.push(`?${params.toString()}`)
  }

  return (
    <div className='flex items-center gap-2'>
      <span className='text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap'>
        Per page:
      </span>
      <Select value={currentPageSize} onValueChange={handlePageSizeChange}>
        <SelectTrigger className='w-17.5 h-9'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
