'use client'

import * as React from 'react'

interface CheckboxProps {
  id?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Checkbox({ id, checked = false, onCheckedChange, disabled, className }: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked)
  }

  return (
    <input
      id={id}
      type='checkbox'
      checked={checked}
      onChange={handleChange}
      disabled={disabled}
      className={`h-5 w-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-600 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
    />
  )
}
