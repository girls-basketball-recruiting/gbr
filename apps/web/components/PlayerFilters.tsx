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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { US_STATES_AND_TERRITORIES } from '@/types/states'
import { getPositionOptions } from '@/types/positions'
import { getGraduationYearOptions } from '@/types/graduationYears'
import { X, ChevronDown, GraduationCap, MapPin, Award, Ruler } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { RangeSlider } from './RangeSlider'

// Helper function to convert inches to feet'inches" format
const formatHeight = (inches: number): string => {
  const feet = Math.floor(inches / 12)
  const remainingInches = inches % 12
  return `${feet}'${remainingInches}"`
}

export function PlayerFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Initialize state from URL params
  const [graduationYear, setGraduationYear] = useState(
    searchParams.get('graduationYear') || '',
  )
  const [position, setPosition] = useState(searchParams.get('position') || '')

  // GPA range state
  const [gpaRange, setGpaRange] = useState<[number, number]>([
    parseFloat(searchParams.get('minGpa') || '0'),
    parseFloat(searchParams.get('maxGpa') || '4'),
  ])

  // Height range state (in inches)
  const [heightRange, setHeightRange] = useState<[number, number]>([
    parseInt(searchParams.get('minHeight') || '60'),
    parseInt(searchParams.get('maxHeight') || '90'),
  ])

  const [state, setState] = useState(searchParams.get('state') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')

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
    switch (key) {
      case 'city':
        setCity(value)
        break
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

  const handleGpaRangeChange = (range: [number, number]) => {
    setGpaRange(range)

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Debounce URL update
    const timer = setTimeout(() => {
      updateURL({
        minGpa: range[0] > 0 ? range[0].toString() : '',
        maxGpa: range[1] < 4 ? range[1].toString() : '',
      })
    }, 300)

    setDebounceTimer(timer)
  }

  const handleHeightRangeChange = (range: [number, number]) => {
    setHeightRange(range)

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Debounce URL update
    const timer = setTimeout(() => {
      updateURL({
        minHeight: range[0] > 60 ? range[0].toString() : '',
        maxHeight: range[1] < 90 ? range[1].toString() : '',
      })
    }, 300)

    setDebounceTimer(timer)
  }

  const clearAllFilters = () => {
    setGraduationYear('')
    setPosition('')
    setGpaRange([0, 4])
    setHeightRange([60, 90])
    setState('')
    setCity('')

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
    gpaRange[0] > 0 || gpaRange[1] < 4,
    heightRange[0] > 60 || heightRange[1] < 90,
    state,
    city,
  ].filter(Boolean).length

  return (
    <div className='sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 mb-6'>
      <div className='max-w-7xl mx-auto px-4 py-4'>
        <div className='flex items-center gap-2 flex-wrap'>
          {/* Graduation Year Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'h-10 px-4 rounded-full border transition-all duration-200 hover:scale-105',
                  graduationYear
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white hover:bg-slate-800 dark:hover:bg-white/90 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                )}
              >
                <GraduationCap className='w-4 h-4 mr-2' />
                {graduationYear
                  ? `Class of ${graduationYear}`
                  : 'Graduation Year'}
                <ChevronDown className='w-4 h-4 ml-2' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-64 p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'>
              <div className='space-y-3'>
                <h4 className='font-semibold text-slate-900 dark:text-white text-sm'>
                  Graduation Year
                </h4>
                <Select
                  value={graduationYear}
                  onValueChange={(value) =>
                    handleSelectChange('graduationYear', value)
                  }
                >
                  <SelectTrigger className='w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'>
                    <SelectValue placeholder='Select year' />
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
            </PopoverContent>
          </Popover>

          {/* Position Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'h-10 px-4 rounded-full border transition-all duration-200 hover:scale-105',
                  position
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white hover:bg-slate-800 dark:hover:bg-white/90 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                )}
              >
                <Award className='w-4 h-4 mr-2' />
                {position
                  ? getPositionOptions().find((p) => p.value === position)
                      ?.label
                  : 'Position'}
                <ChevronDown className='w-4 h-4 ml-2' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-64 p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'>
              <div className='space-y-3'>
                <h4 className='font-semibold text-slate-900 dark:text-white text-sm'>Position</h4>
                <Select
                  value={position}
                  onValueChange={(value) => handleSelectChange('position', value)}
                >
                  <SelectTrigger className='w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'>
                    <SelectValue placeholder='Select position' />
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
            </PopoverContent>
          </Popover>

          {/* Height Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'h-10 px-4 rounded-full border transition-all duration-200 hover:scale-105',
                  heightRange[0] > 60 || heightRange[1] < 90
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white hover:bg-slate-800 dark:hover:bg-white/90 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                )}
              >
                <Ruler className='w-4 h-4 mr-2' />
                {heightRange[0] > 60 || heightRange[1] < 90
                  ? `${formatHeight(heightRange[0])} - ${formatHeight(heightRange[1])}`
                  : 'Height'}
                <ChevronDown className='w-4 h-4 ml-2' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80 p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'>
              <RangeSlider
                min={60}
                max={90}
                step={1}
                value={heightRange}
                onValueChange={handleHeightRangeChange}
                formatValue={formatHeight}
                label='Height Range'
              />
            </PopoverContent>
          </Popover>

          {/* Location Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'h-10 px-4 rounded-full border transition-all duration-200 hover:scale-105',
                  state || city
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white hover:bg-slate-800 dark:hover:bg-white/90 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                )}
              >
                <MapPin className='w-4 h-4 mr-2' />
                {city && state
                  ? `${city}, ${state}`
                  : state || city || 'Location'}
                <ChevronDown className='w-4 h-4 ml-2' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80 p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'>
              <div className='space-y-4'>
                <h4 className='font-semibold text-slate-900 dark:text-white text-sm'>Location</h4>
                <div className='space-y-3'>
                  <div>
                    <Label htmlFor='state' className='text-slate-600 dark:text-slate-300 text-xs mb-2'>
                      State
                    </Label>
                    <Select
                      value={state}
                      onValueChange={(value) => handleSelectChange('state', value)}
                    >
                      <SelectTrigger className='w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'>
                        <SelectValue placeholder='All states' />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES_AND_TERRITORIES.map((stateOption) => (
                          <SelectItem
                            key={stateOption.value}
                            value={stateOption.value}
                          >
                            {stateOption.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor='city' className='text-slate-600 dark:text-slate-300 text-xs mb-2'>
                      City
                    </Label>
                    <Input
                      id='city'
                      value={city}
                      onChange={(e) => handleTextChange('city', e.target.value)}
                      className='w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                      placeholder='Enter city'
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* GPA Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'h-10 px-4 rounded-full border transition-all duration-200 hover:scale-105',
                  gpaRange[0] > 0 || gpaRange[1] < 4
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white hover:bg-slate-800 dark:hover:bg-white/90 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                )}
              >
                GPA
                {(gpaRange[0] > 0 || gpaRange[1] < 4) && (
                  <span className='ml-1'>
                    : {gpaRange[0].toFixed(1)} - {gpaRange[1].toFixed(1)}
                  </span>
                )}
                <ChevronDown className='w-4 h-4 ml-2' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80 p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'>
              <RangeSlider
                min={0}
                max={4}
                step={0.1}
                value={gpaRange}
                onValueChange={handleGpaRangeChange}
                formatValue={(v) => v.toFixed(1)}
                label='GPA Range'
              />
            </PopoverContent>
          </Popover>

          {/* Spacer */}
          <div className='flex-1' />

          {/* Clear All Button */}
          {activeFilterCount > 0 && (
            <Button
              onClick={clearAllFilters}
              variant='ghost'
              size='sm'
              disabled={isPending}
              className='h-10 px-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all'
            >
              <X className='w-4 h-4 mr-2' />
              Clear all ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
