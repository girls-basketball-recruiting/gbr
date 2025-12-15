'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
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
import { HeightSelect } from '@/components/HeightSelect'
import { getPositionOptions } from '@/types/positions'

export function PlayerFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  // Initialize state from URL params
  const [graduationYear, setGraduationYear] = useState(
    searchParams.get('graduationYear') || '',
  )
  const [position, setPosition] = useState(searchParams.get('position') || '')
  const [minGpa, setMinGpa] = useState(searchParams.get('minGpa') || '')
  const [maxGpa, setMaxGpa] = useState(searchParams.get('maxGpa') || '')
  const [minHeight, setMinHeight] = useState(
    searchParams.get('minHeight') || '',
  )
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
      case 'minHeight':
        setMinHeight(value)
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
      case 'minGpa':
        setMinGpa(value)
        break
      case 'maxGpa':
        setMaxGpa(value)
        break
      case 'state':
        setState(value)
        break
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

  const clearAllFilters = () => {
    setGraduationYear('')
    setPosition('')
    setMinGpa('')
    setMaxGpa('')
    setMinHeight('')
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
    minGpa,
    maxGpa,
    minHeight,
    state,
    city,
  ].filter(Boolean).length

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className='lg:hidden w-full mb-4 bg-slate-800 border-slate-700 hover:bg-slate-700'
        variant='outline'
      >
        <span className='flex items-center justify-between w-full'>
          <span className='text-white'>
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </span>
          <span className='text-slate-400'>{isOpen ? '▲' : '▼'}</span>
        </span>
      </Button>

      {/* Filters Card - Always visible on desktop, toggleable on mobile */}
      <Card className={`bg-slate-800 border-slate-700 lg:block ${isOpen ? 'block' : 'hidden'}`}>
        <CardHeader className='hidden lg:block'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-white'>Filters</CardTitle>
            {activeFilterCount > 0 && (
              <span className='bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full'>
                {activeFilterCount}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
        {/* Graduation Year */}
        <div className='space-y-2'>
          <Label htmlFor='graduationYear' className='text-slate-200'>
            Graduation Year
          </Label>
          <Select
            value={graduationYear}
            onValueChange={(value) =>
              handleSelectChange('graduationYear', value)
            }
          >
            <SelectTrigger className='bg-slate-900 border-slate-600 text-white'>
              <SelectValue placeholder='Any year' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='2025'>2025</SelectItem>
              <SelectItem value='2026'>2026</SelectItem>
              <SelectItem value='2027'>2027</SelectItem>
              <SelectItem value='2028'>2028</SelectItem>
              <SelectItem value='2029'>2029</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Primary Position */}
        <div className='space-y-2'>
          <Label htmlFor='primaryPosition' className='text-slate-200'>
            Position
          </Label>
          <Select
            value={position}
            onValueChange={(value) => handleSelectChange('position', value)}
          >
            <SelectTrigger className='bg-slate-900 border-slate-600 text-white'>
              <SelectValue placeholder='Any position' />
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

        {/* GPA Range */}
        <div className='space-y-2'>
          <Label className='text-slate-200'>GPA Range</Label>
          <div className='grid grid-cols-2 gap-2'>
            <div>
              <Input
                type='number'
                step='0.1'
                placeholder='Min'
                value={minGpa}
                onChange={(e) => handleTextChange('minGpa', e.target.value)}
                className='bg-slate-900 border-slate-600 text-white'
              />
            </div>
            <div>
              <Input
                type='number'
                step='0.1'
                placeholder='Max'
                value={maxGpa}
                onChange={(e) => handleTextChange('maxGpa', e.target.value)}
                className='bg-slate-900 border-slate-600 text-white'
              />
            </div>
          </div>
        </div>

        {/* Height */}
        <div className='space-y-2'>
          <Label className='text-slate-200'>Minimum Height</Label>
          <HeightSelect
            value={minHeight}
            onValueChange={(value) => handleSelectChange('minHeight', value)}
            selectClassName='bg-slate-900 border-slate-600 text-white'
          />
        </div>

        {/* State */}
        <div className='space-y-2'>
          <Label htmlFor='state' className='text-slate-200'>
            State
          </Label>
          <Select value={state} onValueChange={(value) => handleSelectChange('state', value)}>
            <SelectTrigger className='bg-slate-900 border-slate-600 text-white'>
              <SelectValue placeholder='Select state' />
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
        <div className='space-y-2'>
          <Label htmlFor='city' className='text-slate-200'>
            City
          </Label>
          <Input
            id='city'
            placeholder='e.g. Los Angeles'
            value={city}
            onChange={(e) => handleTextChange('city', e.target.value)}
            className='bg-slate-900 border-slate-600 text-white'
          />
        </div>

        {/* Clear All Button */}
        {activeFilterCount > 0 && (
          <div className='pt-4'>
            <Button
              variant='outline'
              onClick={clearAllFilters}
              disabled={isPending}
              className='w-full border-slate-600 text-slate-300 hover:bg-slate-800'
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  )
}
