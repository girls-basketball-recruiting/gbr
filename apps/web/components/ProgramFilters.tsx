'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { Button } from '@workspace/ui/components/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Input } from '@workspace/ui/components/input'
import { Switch } from '@workspace/ui/components/switch'
import { Label } from '@workspace/ui/components/label'
import { X } from 'lucide-react'
import { US_STATES_AND_TERRITORIES } from '@/types/states'

const divisions = [
  { value: 'd1', label: 'NCAA D1' },
  { value: 'd2', label: 'NCAA D2' },
  { value: 'd3', label: 'NCAA D3' },
  { value: 'naia', label: 'NAIA' },
  { value: 'juco', label: 'JUCO' },
]

const types = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
]

export function ProgramFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    division: searchParams.get('division') || '',
    state: searchParams.get('state') || '',
    type: searchParams.get('type') || '',
    hasCoach: searchParams.get('hasCoach') === 'true',
  })

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  )

  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams()

    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.division) params.set('division', newFilters.division)
    if (newFilters.state) params.set('state', newFilters.state)
    if (newFilters.type) params.set('type', newFilters.type)
    if (newFilters.hasCoach) params.set('hasCoach', 'true')

    startTransition(() => {
      router.push(`/programs?${params.toString()}`)
    })
  }

  const handleSelectChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const handleTextChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Set new timer for debounced update
    const timer = setTimeout(() => {
      updateURL(newFilters)
    }, 500)

    setDebounceTimer(timer)
  }

  const handleToggleChange = (checked: boolean) => {
    const newFilters = { ...filters, hasCoach: checked }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const clearFilters = () => {
    const cleared = {
      search: '',
      division: '',
      state: '',
      type: '',
      hasCoach: false,
    }
    setFilters(cleared)
    startTransition(() => {
      router.push('/programs')
    })
  }

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  const activeFilterCount = [
    filters.search,
    filters.division,
    filters.state,
    filters.type,
    filters.hasCoach,
  ].filter(Boolean).length

  return (
    <div className='bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6'>
      <div className='flex flex-col gap-4'>
        {/* First Row - Main Filters */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
          {/* Search */}
          <div className='space-y-1.5'>
            <Label htmlFor='search' className='text-slate-600 dark:text-slate-300 text-sm'>
              Search by School Name
            </Label>
            <Input
              id='search'
              type='text'
              placeholder='e.g., Stanford, UConn...'
              value={filters.search}
              onChange={(e) => handleTextChange('search', e.target.value)}
              className='w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-9'
            />
          </div>

          {/* Division Filter */}
          <div className='space-y-1.5'>
            <Label htmlFor='division' className='text-slate-600 dark:text-slate-300 text-sm'>
              Division
            </Label>
            <Select
              value={filters.division}
              onValueChange={(value) => handleSelectChange('division', value)}
            >
              <SelectTrigger className='w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-9'>
                <SelectValue placeholder='All Divisions' />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((div) => (
                  <SelectItem key={div.value} value={div.value}>
                    {div.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* State Filter */}
          <div className='space-y-1.5'>
            <Label htmlFor='state' className='text-slate-600 dark:text-slate-300 text-sm'>
              State
            </Label>
            <Select
              value={filters.state}
              onValueChange={(value) => handleSelectChange('state', value)}
            >
              <SelectTrigger className='w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-9'>
                <SelectValue placeholder='All States' />
              </SelectTrigger>
              <SelectContent>
                {US_STATES_AND_TERRITORIES.map((stateOption) => (
                  <SelectItem key={stateOption.value} value={stateOption.value}>
                    {stateOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className='space-y-1.5'>
            <Label htmlFor='type' className='text-slate-600 dark:text-slate-300 text-sm'>
              Type
            </Label>
            <Select
              value={filters.type}
              onValueChange={(value) => handleSelectChange('type', value)}
            >
              <SelectTrigger className='w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-9'>
                <SelectValue placeholder='All Types' />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Second Row - Has Coach Toggle & Clear */}
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center space-x-2'>
            <Switch
              id='hasCoach'
              checked={filters.hasCoach}
              onCheckedChange={handleToggleChange}
            />
            <Label
              htmlFor='hasCoach'
              className='text-slate-600 dark:text-slate-300 cursor-pointer text-sm'
            >
              Only show programs with registered coaches
            </Label>
          </div>

          {activeFilterCount > 0 && (
            <Button
              onClick={clearFilters}
              variant='ghost'
              size='sm'
              disabled={isPending}
              className='text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            >
              <X className='w-4 h-4 mr-1' />
              Clear {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
