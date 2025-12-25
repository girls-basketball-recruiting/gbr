import * as React from 'react'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import { Input } from '@workspace/ui/components/input'
import { FormFieldWrapper } from '@/components/form/FormFieldWrapper'

export interface GpaInputProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  required?: boolean
  placeholder?: string
  description?: string
}

function GpaInputInner<T extends FieldValues>({
  control,
  name,
  label = 'GPA',
  required,
  placeholder = '3.75',
  description,
}: GpaInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // Convert number to string for input (2 decimal places)
        const displayValue = field.value
          ? Number(field.value).toFixed(2)
          : ''

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value

          // Allow empty string
          if (value === '') {
            field.onChange(null)
            return
          }

          // Allow valid decimal format (one decimal point, up to 2 decimals)
          if (!/^\d*\.?\d{0,2}$/.test(value)) {
            return
          }

          const numValue = parseFloat(value)

          // Only update if it's a valid number and in range 0.0-5.0
          if (!isNaN(numValue) && numValue >= 0 && numValue <= 5.0) {
            field.onChange(numValue)
          } else if (value.endsWith('.') || value.endsWith('.0')) {
            // Allow typing decimal point
            field.onChange(value)
          }
        }

        return (
          <FormFieldWrapper
            label={label}
            required={required}
            error={fieldState.error?.message}
            description={description}
          >
            <Input
              {...field}
              type="text"
              inputMode="decimal"
              placeholder={placeholder}
              value={displayValue}
              onChange={handleChange}
            />
          </FormFieldWrapper>
        )
      }}
    />
  )
}

// Memoized with proper generic typing
export const GpaInput = React.memo(GpaInputInner) as typeof GpaInputInner
