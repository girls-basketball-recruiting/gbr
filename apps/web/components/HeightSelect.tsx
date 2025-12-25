'use client'

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

interface HeightSelectProps {
  value?: number // Height in total inches
  onValueChange?: (value: number) => void
  className?: string
  selectClassName?: string
}

export function HeightSelect({
  value,
  onValueChange,
  className = '',
  selectClassName = '',
}: HeightSelectProps) {
  // Parse height into feet and inches
  const getFeetAndInches = (totalInches?: number) => {
    if (totalInches === undefined || totalInches === 0) return { feet: '', inches: '' }
    const feet = Math.floor(totalInches / 12)
    const inches = totalInches % 12
    return { feet: feet.toString(), inches: inches.toString() }
  }

  const initial = getFeetAndInches(value)
  const [heightFeet, setHeightFeet] = useState(initial.feet)
  const [heightInches, setHeightInches] = useState(initial.inches)

  // Update internal state when value prop changes
  useEffect(() => {
    const { feet, inches } = getFeetAndInches(value)
    setHeightFeet(feet)
    setHeightInches(inches)
  }, [value])

  const notifyChange = (feet: string, inches: string) => {
    if (onValueChange) {
      const f = parseInt(feet || '0')
      const i = parseInt(inches || '0')
      onValueChange(f * 12 + i)
    }
  }

  const handleFeetChange = (feet: string) => {
    setHeightFeet(feet)
    notifyChange(feet, heightInches)
  }

  const handleInchesChange = (inches: string) => {
    setHeightInches(inches)
    notifyChange(heightFeet, inches)
  }

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      <Select value={heightFeet} onValueChange={handleFeetChange}>
        <SelectTrigger className={selectClassName}>
          <SelectValue placeholder='Feet' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='3'>3 ft</SelectItem>
          <SelectItem value='4'>4 ft</SelectItem>
          <SelectItem value='5'>5 ft</SelectItem>
          <SelectItem value='6'>6 ft</SelectItem>
          <SelectItem value='7'>7 ft</SelectItem>
        </SelectContent>
      </Select>
      <Select value={heightInches} onValueChange={handleInchesChange}>
        <SelectTrigger className={selectClassName}>
          <SelectValue placeholder='Inches' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='0'>0 in</SelectItem>
          <SelectItem value='1'>1 in</SelectItem>
          <SelectItem value='2'>2 in</SelectItem>
          <SelectItem value='3'>3 in</SelectItem>
          <SelectItem value='4'>4 in</SelectItem>
          <SelectItem value='5'>5 in</SelectItem>
          <SelectItem value='6'>6 in</SelectItem>
          <SelectItem value='7'>7 in</SelectItem>
          <SelectItem value='8'>8 in</SelectItem>
          <SelectItem value='9'>9 in</SelectItem>
          <SelectItem value='10'>10 in</SelectItem>
          <SelectItem value='11'>11 in</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}