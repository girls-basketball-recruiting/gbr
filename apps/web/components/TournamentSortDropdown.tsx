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

export function TournamentSortDropdown() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSort = searchParams.get('sortBy') || 'date-asc'

  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString())

    if (value === 'date-asc') {
      newParams.delete('sortBy')
    } else {
      newParams.set('sortBy', value)
    }

    // Reset to page 1 when sorting changes
    newParams.delete('page')

    startTransition(() => {
      router.push(`/tournaments?${newParams.toString()}`)
    })
  }

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className='w-48 border-gray' size='sm'>
        <SelectValue placeholder='Sort by...' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='date-asc'>Date (Soonest)</SelectItem>
        <SelectItem value='date-desc'>Date (Latest)</SelectItem>
        <SelectItem value='name-asc'>Name A-Z</SelectItem>
        <SelectItem value='name-desc'>Name Z-A</SelectItem>
        <SelectItem value='attendees-desc'>Most Players</SelectItem>
        <SelectItem value='attendees-asc'>Fewest Players</SelectItem>
      </SelectContent>
    </Select>
  )
}
