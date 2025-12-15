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
  value?: string // Format: "5-10" or "5'10"" or empty
  onValueChange?: (value: string) => void
  feetPlaceholder?: string
  inchesPlaceholder?: string
  className?: string
  selectClassName?: string
}

export function HeightSelect({
  value = '',
  onValueChange,
  feetPlaceholder = 'Feet',
  inchesPlaceholder = 'Inches',
  className = '',
  selectClassName = '',
}: HeightSelectProps) {
  // Parse height into feet and inches
  const parseHeight = (height: string) => {
    if (!height) return { feet: '', inches: '' }
    // Support both "5-10" and "5'10"" formats
    const match = height.match(/(\d+)[-'](\d+)/) || height.match(/(\d+)'(\d+)"?/)
    if (match) {
      return { feet: match[1], inches: match[2] }
    }
    return { feet: '', inches: '' }
  }

  const { feet: initialFeet, inches: initialInches } = parseHeight(value)
  const [heightFeet, setHeightFeet] = useState(initialFeet)
  const [heightInches, setHeightInches] = useState(initialInches)

  // Update internal state when value prop changes
  useEffect(() => {
    const { feet, inches } = parseHeight(value)
    setHeightFeet(feet)
    setHeightInches(inches)
  }, [value])

  // Notify parent when height changes
  const handleFeetChange = (feet: string) => {
    setHeightFeet(feet)
    if (onValueChange) {
      const combinedValue = feet ? `${feet}-${heightInches || '0'}` : ''
      onValueChange(combinedValue)
    }
  }

  const handleInchesChange = (inches: string) => {
    setHeightInches(inches)
    if (onValueChange) {
      const combinedValue = heightFeet ? `${heightFeet}-${inches || '0'}` : ''
      onValueChange(combinedValue)
    }
  }

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      <Select value={heightFeet} onValueChange={handleFeetChange}>
        <SelectTrigger className={selectClassName}>
          <SelectValue placeholder={feetPlaceholder} />
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
          <SelectValue placeholder={inchesPlaceholder} />
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
