'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { useTransition } from 'react'

export function ActiveFilterChips() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const filters = [
    { key: 'graduationYear', label: 'Graduation' },
    { key: 'position', label: 'Position' },
    { key: 'minGpa', label: 'Min GPA' },
    { key: 'maxGpa', label: 'Max GPA' },
    { key: 'minHeight', label: 'Min Height' },
    { key: 'state', label: 'State' },
    { key: 'city', label: 'City' },
  ]

  const activeFilters = filters
    .map((filter) => ({
      ...filter,
      value: searchParams.get(filter.key),
    }))
    .filter((filter) => filter.value)

  if (activeFilters.length === 0) {
    return null
  }

  const removeFilter = (key: string) => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete(key)

    startTransition(() => {
      router.push(`${pathname}?${newParams.toString()}`)
    })
  }

  const formatValue = (key: string, value: string) => {
    if (key === 'position') {
      return value
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
    return value
  }

  return (
    <div className='flex flex-wrap gap-2'>
      {activeFilters.map((filter) => (
        <Button
          key={filter.key}
          variant='outline'
          size='sm'
          onClick={() => removeFilter(filter.key)}
          disabled={isPending}
          className='border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 h-7 px-2'
        >
          <span className='text-xs'>
            {filter.label}: {formatValue(filter.key, filter.value!)}
          </span>
          <svg
            className='ml-1.5 h-3 w-3'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </Button>
      ))}
    </div>
  )
}
