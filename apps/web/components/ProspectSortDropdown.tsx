'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

export function ProspectSortDropdown() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSort = searchParams.get('sortBy') || 'updated'

  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString())

    if (value === 'updated') {
      newParams.delete('sortBy')
    } else {
      newParams.set('sortBy', value)
    }

    // Reset to page 1 when sorting changes
    newParams.delete('page')

    startTransition(() => {
      router.push(`${pathname}?${newParams.toString()}`)
    })
  }

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className='w-48 border-gray' size='sm'>
        <SelectValue placeholder='Sort by...' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='updated'>Recently Modified</SelectItem>
        <SelectItem value='newest'>Recently Added</SelectItem>
        <SelectItem value='oldest'>Oldest First</SelectItem>
        <SelectItem value='name-asc'>Name A-Z</SelectItem>
        <SelectItem value='graduation-asc'>Graduation Year (Youngest)</SelectItem>
        <SelectItem value='graduation-desc'>Graduation Year (Oldest)</SelectItem>
      </SelectContent>
    </Select>
  )
}
