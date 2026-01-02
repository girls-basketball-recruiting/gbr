'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Label } from '@workspace/ui/components/label'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { US_STATES_AND_TERRITORIES } from '@/lib/zod/States'
import { getPositionOptions } from '@/lib/zod/Positions'
import { getGraduationYearOptions } from '@/lib/zod/GraduationYears'
import { AAU_CIRCUITS } from '@/lib/zod/AauCircuits'
import { LEVELS_OF_PLAY } from '@/lib/zod/LevelsOfPlay'
import { DISTANCE_FROM_HOME_OPTIONS } from '@/lib/zod/DistanceFromHome'
import { RangeSlider } from './RangeSlider'
import { MultiSelect } from './ui/multi-select'
import { X } from 'lucide-react'
import { formatHeight } from '@/lib/formatters'

export function PlayerFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Parse array params from URL
  const parseArrayParam = (paramName: string): string[] => {
    const param = searchParams.get(paramName)
    return param ? param.split(',').filter(Boolean) : []
  }

  // Initialize state from URL params
  const [graduationYears, setGraduationYears] = useState<string[]>(parseArrayParam('graduationYears'))
  const [positions, setPositions] = useState<string[]>(parseArrayParam('positions'))
  const [states, setStates] = useState<string[]>(parseArrayParam('states'))
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [desiredDistances, setDesiredDistances] = useState<string[]>(parseArrayParam('desiredDistances'))
  const [desiredLevels, setDesiredLevels] = useState<string[]>(parseArrayParam('desiredLevels'))
  const [aauCircuits, setAauCircuits] = useState<string[]>(parseArrayParam('aauCircuits'))
  const [gpaRange, setGpaRange] = useState<[number, number]>([
    parseFloat(searchParams.get('minGpa') || '0'),
    parseFloat(searchParams.get('maxGpa') || '4'),
  ])
  const [heightRange, setHeightRange] = useState<[number, number]>([
    parseInt(searchParams.get('minHeight') || '60'),
    parseInt(searchParams.get('maxHeight') || '90'),
  ])
  const [ppgRange, setPpgRange] = useState<[number, number]>([
    parseFloat(searchParams.get('minPpg') || '0'),
    parseFloat(searchParams.get('maxPpg') || '40'),
  ])
  const [rpgRange, setRpgRange] = useState<[number, number]>([
    parseFloat(searchParams.get('minRpg') || '0'),
    parseFloat(searchParams.get('maxRpg') || '20'),
  ])
  const [apgRange, setApgRange] = useState<[number, number]>([
    parseFloat(searchParams.get('minApg') || '0'),
    parseFloat(searchParams.get('maxApg') || '15'),
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

  const handleMultiSelectChange = (key: string, values: string[]) => {
    // Update state
    switch (key) {
      case 'graduationYears':
        setGraduationYears(values)
        break
      case 'positions':
        setPositions(values)
        break
      case 'states':
        setStates(values)
        break
      case 'desiredDistances':
        setDesiredDistances(values)
        break
      case 'desiredLevels':
        setDesiredLevels(values)
        break
      case 'aauCircuits':
        setAauCircuits(values)
        break
    }
    // Update URL with comma-separated values
    updateURL({ [key]: values.join(',') })
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

  const handlePpgRangeChange = (value: [number, number]) => {
    setPpgRange(value)
    updateURL({ minPpg: value[0].toString(), maxPpg: value[1].toString() })
  }

  const handleRpgRangeChange = (value: [number, number]) => {
    setRpgRange(value)
    updateURL({ minRpg: value[0].toString(), maxRpg: value[1].toString() })
  }

  const handleApgRangeChange = (value: [number, number]) => {
    setApgRange(value)
    updateURL({ minApg: value[0].toString(), maxApg: value[1].toString() })
  }

  const clearAllFilters = () => {
    setGraduationYears([])
    setPositions([])
    setStates([])
    setCity('')
    setDesiredDistances([])
    setDesiredLevels([])
    setAauCircuits([])
    setGpaRange([0, 4])
    setHeightRange([60, 90])
    setPpgRange([0, 40])
    setRpgRange([0, 20])
    setApgRange([0, 15])

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
    graduationYears.length > 0,
    positions.length > 0,
    states.length > 0,
    city,
    desiredDistances.length > 0,
    desiredLevels.length > 0,
    aauCircuits.length > 0,
    gpaRange[0] > 0 || gpaRange[1] < 4,
    heightRange[0] > 60 || heightRange[1] < 90,
    ppgRange[0] > 0 || ppgRange[1] < 40,
    rpgRange[0] > 0 || rpgRange[1] < 20,
    apgRange[0] > 0 || apgRange[1] < 15,
  ].filter(Boolean).length

  return (
    <div className='bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-5 mb-6'>
      <div className='flex flex-col gap-5'>
        {/* Basic Info & Location */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Graduation Year */}
          <div className='space-y-2'>
            <Label className='text-slate-600 dark:text-slate-300 text-sm font-medium'>
              Graduation Year
            </Label>
            <MultiSelect
              options={getGraduationYearOptions()}
              selected={graduationYears}
              onChange={(values) => handleMultiSelectChange('graduationYears', values)}
              placeholder='All Years'
              className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
              searchPlaceholder='Search years...'
            />
          </div>

          {/* Position */}
          <div className='space-y-2'>
            <Label className='text-slate-600 dark:text-slate-300 text-sm font-medium'>
              Position
            </Label>
            <MultiSelect
              options={getPositionOptions()}
              selected={positions}
              onChange={(values) => handleMultiSelectChange('positions', values)}
              placeholder='All Positions'
              className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
              searchPlaceholder='Search positions...'
            />
          </div>

          {/* State */}
          <div className='space-y-2'>
            <Label className='text-slate-600 dark:text-slate-300 text-sm font-medium'>
              State
            </Label>
            <MultiSelect
              options={US_STATES_AND_TERRITORIES as any}
              selected={states}
              onChange={(values) => handleMultiSelectChange('states', values)}
              placeholder='All States'
              className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
              searchPlaceholder='Search states...'
            />
          </div>

          {/* City */}
          <div className='space-y-2'>
            <Label htmlFor='city' className='text-slate-600 dark:text-slate-300 text-sm font-medium'>
              City
            </Label>
            <Input
              id='city'
              type='text'
              placeholder='Enter city name'
              value={city}
              onChange={(e) => handleTextChange('city', e.target.value)}
              className='w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white h-10'
            />
          </div>
        </div>

        {/* Preferences */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
          {/* Desired Levels */}
          <div className='space-y-2'>
            <Label className='text-slate-600 dark:text-slate-300 text-sm font-medium'>
              Desired College Level
            </Label>
            <MultiSelect
              options={LEVELS_OF_PLAY}
              selected={desiredLevels}
              onChange={(values) => handleMultiSelectChange('desiredLevels', values)}
              placeholder='Any Level'
              className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
              searchPlaceholder='Search levels...'
            />
          </div>

          {/* Desired Distance */}
          <div className='space-y-2'>
            <Label className='text-slate-600 dark:text-slate-300 text-sm font-medium'>
              Distance from Home
            </Label>
            <MultiSelect
              options={DISTANCE_FROM_HOME_OPTIONS}
              selected={desiredDistances}
              onChange={(values) => handleMultiSelectChange('desiredDistances', values)}
              placeholder='Any Distance'
              className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
              searchPlaceholder='Search distance...'
            />
          </div>

          {/* AAU Circuit */}
          <div className='space-y-2'>
            <Label className='text-slate-600 dark:text-slate-300 text-sm font-medium'>
              AAU Circuit
            </Label>
            <MultiSelect
              options={AAU_CIRCUITS}
              selected={aauCircuits}
              onChange={(values) => handleMultiSelectChange('aauCircuits', values)}
              placeholder='All Circuits'
              className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
              searchPlaceholder='Search circuits...'
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
              label='Height'
            />
          </div>
        </div>

        {/* Stats Filters */}
        <div className='grid grid-cols-1 sm:grid-cols-4 gap-5'>
          {/* GPA Range */}
          <div>
            <RangeSlider
              min={0}
              max={4}
              step={0.1}
              value={gpaRange}
              onValueChange={handleGpaRangeChange}
              formatValue={(v) => v.toFixed(1)}
              label='GPA'
            />
          </div>

          {/* PPG Range */}
          <div>
            <RangeSlider
              min={0}
              max={40}
              step={0.5}
              value={ppgRange}
              onValueChange={handlePpgRangeChange}
              formatValue={(v) => `${v.toFixed(1)} ppg`}
              label='Points Per Game'
            />
          </div>

          {/* RPG Range */}
          <div>
            <RangeSlider
              min={0}
              max={20}
              step={0.5}
              value={rpgRange}
              onValueChange={handleRpgRangeChange}
              formatValue={(v) => `${v.toFixed(1)} rpg`}
              label='Rebounds Per Game'
            />
          </div>

          {/* APG Range */}
          <div>
            <RangeSlider
              min={0}
              max={15}
              step={0.5}
              value={apgRange}
              onValueChange={handleApgRangeChange}
              formatValue={(v) => `${v.toFixed(1)} apg`}
              label='Assists Per Game'
            />
          </div>

          {/* Clear All Button */}
          <div className='flex items-end'>
            {activeFilterCount > 0 && (
              <Button
                onClick={clearAllFilters}
                variant='outline'
                size='default'
                disabled={isPending}
                className='h-10 w-full'
              >
                <X className='w-4 h-4 mr-2' />
                Clear {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
