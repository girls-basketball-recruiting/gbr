'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Label } from '@workspace/ui/components/label'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { US_STATES_AND_TERRITORIES } from '@/lib/zod/States'
import { getPositionOptions } from '@/lib/zod/Positions'
import { MultiSelect } from './ui/multi-select'
import { X } from 'lucide-react'

export function ProspectFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const parseArrayParam = (paramName: string): string[] => {
    const param = searchParams.get(paramName)
    return param ? param.split(',').filter(Boolean) : []
  }

  const [lastName, setLastName] = useState(searchParams.get('lastName') || '')
  const [positions, setPositions] = useState<string[]>(parseArrayParam('positions'))
  const [states, setStates] = useState<string[]>(parseArrayParam('states'))
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })

    startTransition(() => {
      router.push(`/prospects?${newParams.toString()}`)
    })
  }

  const handleTextChange = (key: string, value: string) => {
    if (key === 'lastName') {
      setLastName(value)
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      updateURL({ [key]: value })
    }, 500)

    setDebounceTimer(timer)
  }

  const handleMultiSelectChange = (key: string, values: string[]) => {
    switch (key) {
      case 'positions':
        setPositions(values)
        break
      case 'states':
        setStates(values)
        break
    }
    updateURL({ [key]: values.join(',') })
  }

  const clearAllFilters = () => {
    setLastName('')
    setPositions([])
    setStates([])

    startTransition(() => {
      router.push('/prospects')
    })
  }

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  const activeFilterCount = [
    lastName,
    positions.length > 0,
    states.length > 0,
  ].filter(Boolean).length

  return (
    <div className='rounded-lg p-5 mb-6 bg-accent'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {/* Last Name */}
        <div className='space-y-0.5'>
          <Label htmlFor='prospectLastName' className='text-sm font-medium'>
            Last Name
          </Label>
          <Input
            id='prospectLastName'
            type='text'
            placeholder='Search by last name'
            value={lastName}
            onChange={(e) => handleTextChange('lastName', e.target.value)}
            className='w-full bg-white border-gray'
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
      </div>

      {activeFilterCount > 0 && (
        <div className='mt-4'>
          <Button
            onClick={clearAllFilters}
            variant='outline'
            size='default'
            disabled={isPending}
          >
            <X className='w-4 h-4 mr-2' />
            Clear {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'}
          </Button>
        </div>
      )}
    </div>
  )
}
