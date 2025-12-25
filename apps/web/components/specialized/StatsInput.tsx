import * as React from 'react'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import { Input } from '@workspace/ui/components/input'
import { FormFieldWrapper } from '@/components/form/FormFieldWrapper'

export interface StatsInputProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  required?: boolean
  placeholder?: string
  description?: string
  suffix?: string
}

function StatsInputInner<T extends FieldValues>({
  control,
  name,
  label,
  required,
  placeholder = '0.0',
  description,
  suffix,
}: StatsInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // Convert number to string for input (1 decimal place for stats)
        const displayValue = field.value
          ? Number(field.value).toFixed(1)
          : ''

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value

          // Allow empty string
          if (value === '') {
            field.onChange(null)
            return
          }

          // Allow valid decimal format (one decimal point, up to 1 decimal)
          if (!/^\d*\.?\d{0,1}$/.test(value)) {
            return
          }

          const numValue = parseFloat(value)

          // Only update if it's a valid number and non-negative
          if (!isNaN(numValue) && numValue >= 0) {
            field.onChange(numValue)
          } else if (value.endsWith('.')) {
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
            <div className="relative">
              <Input
                {...field}
                type="text"
                inputMode="decimal"
                placeholder={placeholder}
                value={displayValue}
                onChange={handleChange}
              />
              {suffix && (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-sm text-gray-500">{suffix}</span>
                </div>
              )}
            </div>
          </FormFieldWrapper>
        )
      }}
    />
  )
}

// Memoized with proper generic typing
export const StatsInput = React.memo(StatsInputInner) as typeof StatsInputInner
