'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

export function ProgramSortSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sortBy = searchParams.get('sortBy') || 'school-asc'

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'school-asc') {
      params.delete('sortBy')
    } else {
      params.set('sortBy', value)
    }

    router.push(`/programs?${params.toString()}`)
  }

  return (
    <Select value={sortBy} onValueChange={handleSortChange}>
      <SelectTrigger className='w-[180px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'>
        <SelectValue placeholder='Sort by' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='school-asc'>School (A-Z)</SelectItem>
        <SelectItem value='school-desc'>School (Z-A)</SelectItem>
        <SelectItem value='division-asc'>Division</SelectItem>
        <SelectItem value='state-asc'>State (A-Z)</SelectItem>
      </SelectContent>
    </Select>
  )
}
