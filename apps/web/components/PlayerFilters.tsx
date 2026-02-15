'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Label } from '@workspace/ui/components/label'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { US_STATES_AND_TERRITORIES } from '@/lib/zod/States'
import { getPositionOptions } from '@/lib/zod/Positions'
import { getGraduationYearOptions } from '@/lib/zod/GraduationYears'
import { AAU_CIRCUITS } from '@/lib/zod/AauCircuits'
import { AAU_AGE_BRACKETS } from '@/lib/zod/AauAgeBrackets'
import { LEVELS_OF_PLAY } from '@/lib/zod/LevelsOfPlay'
import { DISTANCE_FROM_HOME_OPTIONS } from '@/lib/zod/DistanceFromHome'
import { RangeSlider } from './RangeSlider'
import { MultiSelect } from './ui/multi-select'
import { X } from 'lucide-react'
import { formatHeight } from '@/lib/formatters'

export function PlayerFilters() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const isPublic = !isSignedIn
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
  const [lastName, setLastName] = useState(searchParams.get('lastName') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [desiredDistances, setDesiredDistances] = useState<string[]>(parseArrayParam('desiredDistances'))
  const [desiredLevels, setDesiredLevels] = useState<string[]>(parseArrayParam('desiredLevels'))
  const [aauCircuits, setAauCircuits] = useState<string[]>(parseArrayParam('aauCircuits'))
  const [aauAgeBrackets, setAauAgeBrackets] = useState<string[]>(parseArrayParam('aauAgeBrackets'))
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
      case 'aauAgeBrackets':
        setAauAgeBrackets(values)
        break
    }
    // Update URL with comma-separated values
    updateURL({ [key]: values.join(',') })
  }

  const handleTextChange = (key: string, value: string) => {
    // Update state
    if (key === 'lastName') {
      setLastName(value)
    } else if (key === 'city') {
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
    setLastName('')
    setCity('')
    setDesiredDistances([])
    setDesiredLevels([])
    setAauCircuits([])
    setAauAgeBrackets([])
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
    lastName,
    city,
    desiredDistances.length > 0,
    desiredLevels.length > 0,
    aauCircuits.length > 0,
    aauAgeBrackets.length > 0,
    gpaRange[0] > 0 || gpaRange[1] < 4,
    heightRange[0] > 60 || heightRange[1] < 90,
    ppgRange[0] > 0 || ppgRange[1] < 40,
    rpgRange[0] > 0 || rpgRange[1] < 20,
    apgRange[0] > 0 || apgRange[1] < 15,
  ].filter(Boolean).length

  return (
    <div className='rounded-lg p-5 mb-6 bg-accent'>
      <div className='flex flex-col gap-5'>
        {/* Basic Info & Location */}
        <div className='grid grid-cols-2 lg:grid-cols-5 gap-4'>
          {/* Last Name */}
          <div className='space-y-0.5'>
            <Label htmlFor='lastName' className='text-sm font-medium'>
              Last Name
            </Label>
            <Input
              id='lastName'
              type='text'
              placeholder='Search by last name'
              value={lastName}
              onChange={(e) => handleTextChange('lastName', e.target.value)}
              className='w-full bg-white border-gray'
            />
          </div>

          {/* Graduation Year */}
          <div className='space-y-0.5'>
            <Label className='text-sm font-medium'>
              Graduation Year
            </Label>
            <MultiSelect
              options={getGraduationYearOptions()}
              selected={graduationYears}
              onChange={(values) => handleMultiSelectChange('graduationYears', values)}
              placeholder='All Years'
              searchPlaceholder='Search years...'
            />
          </div>

          {/* Position */}
          <div className='space-y-0.5'>
            <Label className='text-sm font-medium'>
              Position
            </Label>
            <MultiSelect
              options={getPositionOptions()}
              selected={positions}
              onChange={(values) => handleMultiSelectChange('positions', values)}
              placeholder='All Positions'
              searchPlaceholder='Search positions...'
            />
          </div>

          {/* State */}
          <div className='space-y-0.5'>
            <Label className='text-sm font-medium'>
              State
            </Label>
            <MultiSelect
              options={US_STATES_AND_TERRITORIES as any}
              selected={states}
              onChange={(values) => handleMultiSelectChange('states', values)}
              placeholder='All States'
              searchPlaceholder='Search states...'
            />
          </div>

          {/* City */}
          <div className='space-y-0.5'>
            <Label htmlFor='city' className='text-sm font-medium'>
              City
            </Label>
            <Input
              id='city'
              type='text'
              placeholder='Enter city name'
              value={city}
              onChange={(e) => handleTextChange('city', e.target.value)}
              className='w-full bg-white border-gray'
            />
          </div>
        </div>

        {/* Preferences - Hidden in public view */}
        {!isPublic && (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {/* Desired Levels */}
            <div className='space-y-0.5'>
              <Label className='text-sm font-medium'>
                Desired Level of Play
              </Label>
              <MultiSelect
                options={LEVELS_OF_PLAY}
                selected={desiredLevels}
                onChange={(values) => handleMultiSelectChange('desiredLevels', values)}
                placeholder='Any Level'
                searchPlaceholder='Search levels...'
              />
            </div>

            {/* Desired Distance */}
            <div className='space-y-0.5'>
              <Label className='text-sm font-medium'>
                Distance from Home
              </Label>
              <MultiSelect
                options={DISTANCE_FROM_HOME_OPTIONS}
                selected={desiredDistances}
                onChange={(values) => handleMultiSelectChange('desiredDistances', values)}
                placeholder='Any Distance'
                searchPlaceholder='Search distance...'
              />
            </div>

            {/* AAU Circuit */}
            <div className='space-y-0.5'>
              <Label className='text-sm font-medium'>
                AAU Circuit
              </Label>
              <MultiSelect
                options={AAU_CIRCUITS}
                selected={aauCircuits}
                onChange={(values) => handleMultiSelectChange('aauCircuits', values)}
                placeholder='All Circuits'
                searchPlaceholder='Search circuits...'
              />
            </div>

            {/* AAU Age Bracket */}
            <div className='space-y-0.5'>
              <Label className='text-sm font-medium'>
                AAU Age Bracket
              </Label>
              <MultiSelect
                options={AAU_AGE_BRACKETS}
                selected={aauAgeBrackets}
                onChange={(values) => handleMultiSelectChange('aauAgeBrackets', values)}
                placeholder='All Brackets'
                searchPlaceholder='Search brackets...'
              />
            </div>
          </div>
        )}

        {/* Stats Filters - Hidden in public view */}
        {!isPublic && (
          <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5'>
            {/* Height Range */}
            <div>
              <RangeSlider
                min={48}
                max={96}
                step={1}
                value={heightRange}
                onValueChange={handleHeightRangeChange}
                formatValue={formatHeight}
                label='Height'
              />
            </div>

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
                max={50}
                step={0.5}
                value={ppgRange}
                onValueChange={handlePpgRangeChange}
                formatValue={(v) => `${v.toFixed(1)} ppg`}
                label='PPG'
              />
            </div>

            {/* RPG Range */}
            <div>
              <RangeSlider
                min={0}
                max={50}
                step={0.5}
                value={rpgRange}
                onValueChange={handleRpgRangeChange}
                formatValue={(v) => `${v.toFixed(1)} rpg`}
                label='RPG'
              />
            </div>

            {/* APG Range */}
            <div>
              <RangeSlider
                min={0}
                max={50}
                step={0.5}
                value={apgRange}
                onValueChange={handleApgRangeChange}
                formatValue={(v) => `${v.toFixed(1)} apg`}
                label='APG'
              />
            </div>

            {/* Clear All Button */}
            {activeFilterCount > 0 && (
              <div className='flex items-end sm:col-span-2 lg:col-span-3 xl:col-span-5'>
                <Button
                  onClick={clearAllFilters}
                  variant='outline'
                  size='default'
                  disabled={isPending}
                  className='w-full sm:w-auto'
                >
                  <X className='w-4 h-4 mr-2' />
                  Clear {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Clear All Button for public view */}
        {isPublic && activeFilterCount > 0 && (
          <div className='flex justify-end'>
            <Button
              onClick={clearAllFilters}
              variant='outline'
              size='default'
              disabled={isPending}
              className='h-10'
            >
              <X className='w-4 h-4 mr-2' />
              Clear {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
