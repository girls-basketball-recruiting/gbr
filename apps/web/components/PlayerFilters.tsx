'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Label } from '@workspace/ui/components/label'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { US_STATES_AND_TERRITORIES } from '@/types/states'
import { getPositionOptions } from '@/types/positions'
import { getGraduationYearOptions } from '@/types/graduationYears'
import { RangeSlider } from './RangeSlider'
import { X } from 'lucide-react'

export function PlayerFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Initialize state from URL params
  const [graduationYear, setGraduationYear] = useState(
    searchParams.get('graduationYear') || '',
  )
  const [position, setPosition] = useState(searchParams.get('position') || '')
  const [state, setState] = useState(searchParams.get('state') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [gpaRange, setGpaRange] = useState<[number, number]>([
    parseFloat(searchParams.get('minGpa') || '0'),
    parseFloat(searchParams.get('maxGpa') || '4'),
  ])
  const [heightRange, setHeightRange] = useState<[number, number]>([
    parseInt(searchParams.get('minHeight') || '60'),
    parseInt(searchParams.get('maxHeight') || '90'),
  ])

  // Debounce timer ref
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
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

    // Navigate with new params
    startTransition(() => {
      router.push(`/players?${newParams.toString()}`)
    })
  }

  const handleSelectChange = (key: string, value: string) => {
    // Update state
    switch (key) {
      case 'graduationYear':
        setGraduationYear(value)
        break
      case 'position':
        setPosition(value)
        break
      case 'state':
        setState(value)
        break
    }

    // Immediately update URL for selects
    updateURL({ [key]: value })
  }

  const handleTextChange = (key: string, value: string) => {
    // Update state
    if (key === 'city') {
      setCity(value)
    }

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Set new timer for debounced update
    const timer = setTimeout(() => {
      updateURL({ [key]: value })
    }, 500)

    setDebounceTimer(timer)
  }

  const handleGpaRangeChange = (value: [number, number]) => {
    setGpaRange(value)
    updateURL({ minGpa: value[0].toString(), maxGpa: value[1].toString() })
  }

  const handleHeightRangeChange = (value: [number, number]) => {
    setHeightRange(value)
    updateURL({ minHeight: value[0].toString(), maxHeight: value[1].toString() })
  }

  const formatHeight = (inches: number) => {
    const feet = Math.floor(inches / 12)
    const remainingInches = inches % 12
    return `${feet}'${remainingInches}"`
  }

  const clearAllFilters = () => {
    setGraduationYear('')
    setPosition('')
    setState('')
    setCity('')
    setGpaRange([0, 4])
    setHeightRange([60, 90])

    startTransition(() => {
      router.push('/players')
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

  // Count active filters
  const activeFilterCount = [
    graduationYear,
    position,
    state,
    city,
    gpaRange[0] > 0 || gpaRange[1] < 4,
    heightRange[0] > 60 || heightRange[1] < 90,
  ].filter(Boolean).length

  return (
    <div className='bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6'>
      <div className='flex flex-col gap-4'>
        {/* First Row - Main Filters */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
          {/* Graduation Year */}
          <div className='space-y-1.5'>
            <Label htmlFor='graduationYear' className='text-slate-600 dark:text-slate-300 text-sm'>
              Graduation Year
            </Label>
            <Select
              value={graduationYear}
              onValueChange={(value) => handleSelectChange('graduationYear', value)}
            >
              <SelectTrigger className='w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-9'>
                <SelectValue placeholder='All Years' />
              </SelectTrigger>
              <SelectContent>
                {getGraduationYearOptions().map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Position */}
          <div className='space-y-1.5'>
            <Label htmlFor='position' className='text-slate-600 dark:text-slate-300 text-sm'>
              Position
            </Label>
            <Select
              value={position}
              onValueChange={(value) => handleSelectChange('position', value)}
            >
              <SelectTrigger className='w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-9'>
                <SelectValue placeholder='All Positions' />
              </SelectTrigger>
              <SelectContent>
                {getPositionOptions().map((pos) => (
                  <SelectItem key={pos.value} value={pos.value}>
                    {pos.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* State */}
          <div className='space-y-1.5'>
            <Label htmlFor='state' className='text-slate-600 dark:text-slate-300 text-sm'>
              State
            </Label>
            <Select
              value={state}
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

          {/* City */}
          <div className='space-y-1.5'>
            <Label htmlFor='city' className='text-slate-600 dark:text-slate-300 text-sm'>
              City
            </Label>
            <Input
              id='city'
              type='text'
              placeholder='Enter City'
              value={city}
              onChange={(e) => handleTextChange('city', e.target.value)}
              className='w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-9'
            />
          </div>
        </div>

        {/* Second Row - Range Filters */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* GPA Range */}
          <div>
            <RangeSlider
              min={0}
              max={4}
              step={0.1}
              value={gpaRange}
              onValueChange={handleGpaRangeChange}
              formatValue={(v) => v.toFixed(1)}
              label='GPA Range'
            />
          </div>

          {/* Height Range */}
          <div>
            <RangeSlider
              min={60}
              max={90}
              step={1}
              value={heightRange}
              onValueChange={handleHeightRangeChange}
              formatValue={formatHeight}
              label='Height Range'
            />
          </div>

          {/* Clear All Button */}
          <div className='flex items-end'>
            {activeFilterCount > 0 && (
              <Button
                onClick={clearAllFilters}
                variant='ghost'
                size='sm'
                disabled={isPending}
                className='h-9 w-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              >
                <X className='w-4 h-4 mr-1' />
                Clear {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
