'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Label } from '@workspace/ui/components/label'
import { Button } from '@workspace/ui/components/button'
import { Switch } from '@workspace/ui/components/switch'
import { US_STATES_AND_TERRITORIES } from '@/lib/zod/States'
import { MultiSelect } from './ui/multi-select'
import { DateRangePicker } from './ui/date-range-picker'
import { X } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

export function TournamentFilters() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Parse array params from URL
  const parseArrayParam = (paramName: string): string[] => {
    const param = searchParams.get(paramName)
    return param ? param.split(',').filter(Boolean) : []
  }

  // Initialize state from URL params
  const [states, setStates] = useState<string[]>(parseArrayParam('states'))
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = searchParams.get('startDate')
    const to = searchParams.get('endDate')
    if (from || to) {
      return {
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      }
    }
    return undefined
  })
  const [hasPlayersAttending, setHasPlayersAttending] = useState(
    searchParams.get('hasPlayers') === 'true'
  )
  const [hasCoachesAttending, setHasCoachesAttending] = useState(
    searchParams.get('hasCoaches') === 'true'
  )
  const [includePast, setIncludePast] = useState(
    searchParams.get('includePast') === 'true'
  )

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString())

    // Update or remove params
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })

    // Reset to page 1 when filters change
    newParams.delete('page')

    startTransition(() => {
      router.push(`/tournaments?${newParams.toString()}`)
    })
  }

  const handleStatesChange = (values: string[]) => {
    setStates(values)
    updateURL({ states: values.join(',') })
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    const startDate = range?.from
      ? range.from.toISOString().split('T')[0] ?? ''
      : ''
    const endDate = range?.to
      ? range.to.toISOString().split('T')[0] ?? ''
      : ''
    updateURL({ startDate, endDate })
  }

  const handleToggle = (
    key: 'hasPlayers' | 'hasCoaches' | 'includePast',
    value: boolean
  ) => {
    switch (key) {
      case 'hasPlayers':
        setHasPlayersAttending(value)
        break
      case 'hasCoaches':
        setHasCoachesAttending(value)
        break
      case 'includePast':
        setIncludePast(value)
        break
    }
    updateURL({ [key]: value ? 'true' : '' })
  }

  const clearAllFilters = () => {
    setStates([])
    setDateRange(undefined)
    setHasPlayersAttending(false)
    setHasCoachesAttending(false)
    setIncludePast(false)

    startTransition(() => {
      router.push('/tournaments')
    })
  }

  // Count active filters
  const activeFilterCount = [
    states.length > 0,
    dateRange?.from || dateRange?.to,
    hasPlayersAttending,
    hasCoachesAttending,
    includePast,
  ].filter(Boolean).length

  return (
    <div className='rounded-lg p-5 mb-6 bg-accent'>
      <div className='flex flex-col gap-4'>
        {/* Filters Row - responsive layout */}
        <div className={`grid gap-4 ${isSignedIn ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {/* Date Range */}
          <div className='space-y-0.5'>
            <Label className='text-sm font-medium'>Date Range</Label>
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder='Select dates'
            />
          </div>

          {/* State */}
          <div className='space-y-0.5'>
            <Label className='text-sm font-medium'>State</Label>
            <MultiSelect
              options={US_STATES_AND_TERRITORIES as any}
              selected={states}
              onChange={handleStatesChange}
              placeholder='All States'
              searchPlaceholder='Search states...'
            />
          </div>

          {/* Toggle Switches - only for authenticated users */}
          {isSignedIn && (
            <>
              <div className='flex items-center gap-2 xl:pt-6'>
                <Switch
                  id='hasPlayers'
                  checked={hasPlayersAttending}
                  onCheckedChange={(checked) =>
                    handleToggle('hasPlayers', checked)
                  }
                />
                <Label htmlFor='hasPlayers' className='text-sm cursor-pointer'>
                  Has players attending
                </Label>
              </div>
              <div className='flex items-center gap-2 xl:pt-6'>
                <Switch
                  id='hasCoaches'
                  checked={hasCoachesAttending}
                  onCheckedChange={(checked) =>
                    handleToggle('hasCoaches', checked)
                  }
                />
                <Label htmlFor='hasCoaches' className='text-sm cursor-pointer'>
                  Has coaches attending
                </Label>
              </div>
              <div className='flex items-center gap-2 xl:pt-6'>
                <Switch
                  id='includePast'
                  checked={includePast}
                  onCheckedChange={(checked) =>
                    handleToggle('includePast', checked)
                  }
                />
                <Label htmlFor='includePast' className='text-sm cursor-pointer'>
                  Include past tournaments
                </Label>
              </div>
            </>
          )}
        </div>

        {/* Clear All Button */}
        {activeFilterCount > 0 && (
          <div className='flex justify-end'>
            <Button
              onClick={clearAllFilters}
              variant='outline'
              size='default'
              disabled={isPending}
              className='h-10'
            >
              <X className='w-4 h-4 mr-2' />
              Clear {activeFilterCount}{' '}
              {activeFilterCount === 1 ? 'filter' : 'filters'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
