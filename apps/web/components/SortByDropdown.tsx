'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

export function SortByDropdown() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSort = searchParams.get('sortBy') || 'newest'

  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString())

    if (value === 'newest') {
      newParams.delete('sortBy')
    } else {
      newParams.set('sortBy', value)
    }

    // Reset to page 1 when sorting changes
    newParams.delete('page')

    startTransition(() => {
      router.push(`/players?${newParams.toString()}`)
    })
  }

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className='w-[200px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white'>
        <SelectValue placeholder='Sort by...' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='newest'>Newest First</SelectItem>
        <SelectItem value='oldest'>Oldest First</SelectItem>
        <SelectItem value='graduation-asc'>
          Graduation Year (Ascending)
        </SelectItem>
        <SelectItem value='graduation-desc'>
          Graduation Year (Descending)
        </SelectItem>
        <SelectItem value='gpa-desc'>GPA (Highest First)</SelectItem>
        <SelectItem value='gpa-asc'>GPA (Lowest First)</SelectItem>
      </SelectContent>
    </Select>
  )
}
