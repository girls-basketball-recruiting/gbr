'use client'

import * as React from 'react'
import { Slider } from '@workspace/ui/components/slider'
import { cn } from '@workspace/ui/lib/utils'

interface RangeSliderProps {
  min: number
  max: number
  step?: number
  value: [number, number]
  onValueChange: (value: [number, number]) => void
  formatValue?: (value: number) => string
  label?: string
  className?: string
}

export function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onValueChange,
  formatValue,
  label,
  className,
}: RangeSliderProps) {
  const format = formatValue || ((v) => v.toString())

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium text-slate-900 dark:text-white'>{label}</span>
          <span className='text-sm text-slate-600 dark:text-slate-400'>
            {format(value[0])} - {format(value[1])}
          </span>
        </div>
      )}

      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(newValue) => {
          if (
            Array.isArray(newValue) &&
            newValue.length === 2 &&
            typeof newValue[0] === 'number' &&
            typeof newValue[1] === 'number'
          ) {
            onValueChange([newValue[0], newValue[1]])
          }
        }}
        className='w-full'
      />

      <div className='flex items-center justify-between text-xs text-slate-500 dark:text-slate-500'>
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}
