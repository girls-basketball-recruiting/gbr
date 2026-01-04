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
import { US_STATES_AND_TERRITORIES } from '@/lib/zod/States'
import { MultiSelect } from '@/components/ui/multi-select'

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
  const [conferences, setConferences] = useState<{ value: string; label: string }[]>([])

  // Parse array params from URL
  const parseDivisions = (): string[] => {
    const divParam = searchParams.get('divisions')
    return divParam ? divParam.split(',') : []
  }

  const parseStates = (): string[] => {
    const stateParam = searchParams.get('states')
    return stateParam ? stateParam.split(',') : []
  }

  const parseConferences = (): string[] => {
    const confParam = searchParams.get('conferences')
    return confParam ? confParam.split(',') : []
  }

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    divisions: parseDivisions(),
    states: parseStates(),
    conferences: parseConferences(),
    type: searchParams.get('type') || '',
    hasCoach: searchParams.get('hasCoach') === 'true',
  })

  // Fetch unique conferences
  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const response = await fetch('/api/programs/conferences')
        if (response.ok) {
          const data = await response.json()
          setConferences(data.conferences || [])
        }
      } catch (error) {
        console.error('Failed to fetch conferences:', error)
      }
    }
    fetchConferences()
  }, [])

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  )

  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams()

    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.divisions.length > 0) params.set('divisions', newFilters.divisions.join(','))
    if (newFilters.states.length > 0) params.set('states', newFilters.states.join(','))
    if (newFilters.conferences.length > 0) params.set('conferences', newFilters.conferences.join(','))
    if (newFilters.type) params.set('type', newFilters.type)
    if (newFilters.hasCoach) params.set('hasCoach', 'true')

    startTransition(() => {
      router.push(`/programs?${params.toString()}`)
    })
  }

  const handleMultiSelectChange = (key: string, values: string[]) => {
    const newFilters = { ...filters, [key]: values }
    setFilters(newFilters)
    updateURL(newFilters)
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
      divisions: [],
      states: [],
      conferences: [],
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
    filters.search ? 1 : 0,
    filters.divisions.length,
    filters.states.length,
    filters.conferences.length,
    filters.type ? 1 : 0,
    filters.hasCoach ? 1 : 0,
  ].reduce((sum, val) => sum + val, 0)

  return (
    <div className='rounded-lg p-5 mb-6 bg-accent'>
      <div className='flex flex-col gap-5'>
        {/* Main Filters */}
        <div className='grid gap-5'>
          <div className='grid md:grid-cols-2 lg:grid-cols-5 gap-5'>
            {/* Search */}
            <div className='space-y-0.5'>
              <Label htmlFor='search' className='text-sm font-medium'>
                School Name
              </Label>
              <Input
                id='search'
                type='text'
                placeholder='Search schools...'
                value={filters.search}
                onChange={(e) => handleTextChange('search', e.target.value)}
                className='w-full border-gray bg-white'
              />
            </div>

            {/* State Filter */}
            <div className='space-y-0.5'>
              <Label className='text-sm font-medium'>
                State
              </Label>
              <MultiSelect
                options={[...US_STATES_AND_TERRITORIES]}
                selected={filters.states}
                onChange={(values) => handleMultiSelectChange('states', values)}
                placeholder='All States'
                searchPlaceholder='Search states...'
              />
            </div>

            {/* Division Filter */}
            <div className='space-y-0.5'>
              <Label className='text-sm font-medium'>
                Division
              </Label>
              <MultiSelect
                options={divisions}
                selected={filters.divisions}
                onChange={(values) => handleMultiSelectChange('divisions', values)}
                placeholder='All Divisions'
                searchPlaceholder='Search divisions...'
              />
            </div>

            {/* Conference Filter */}
            <div className='space-y-0.5'>
              <Label className='text-sm font-medium'>
                Conference
              </Label>
              <MultiSelect
                options={conferences}
                selected={filters.conferences}
                onChange={(values) => handleMultiSelectChange('conferences', values)}
                placeholder='All Conferences'
                searchPlaceholder='Search conferences...'
              />
            </div>

            {/* Type Filter */}
            <div className='space-y-0.5'>
              <Label htmlFor='type' className='text-sm font-medium'>
                Institution Type
              </Label>
              <Select
                value={filters.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger className='w-full border-gray bg-white'>
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
        </div>

        {/* Options & Clear */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <div className='flex items-center space-x-3'>
            <Switch
              id='hasCoach'
              checked={filters.hasCoach}
              onCheckedChange={handleToggleChange}
            />
            <Label
              htmlFor='hasCoach'
              className='text-sm font-medium'
            >
              Only show programs with registered coaches
            </Label>
          </div>

          {activeFilterCount > 0 && (
            <Button
              onClick={clearFilters}
              variant='destructive'
              size='sm'
              disabled={isPending}
            >
              <X className='w-4 h-4 mr-2' />
              Clear {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
