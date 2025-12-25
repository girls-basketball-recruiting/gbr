import * as React from 'react'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import { Input } from '@workspace/ui/components/input'
import { FormFieldWrapper } from '@/components/form/FormFieldWrapper'

export interface WeightInputProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  required?: boolean
  placeholder?: string
  description?: string
}

function WeightInputInner<T extends FieldValues>({
  control,
  name,
  label = 'Weight',
  required,
  placeholder = '185',
  description,
}: WeightInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // Convert number to string for input
        const displayValue = field.value ? String(field.value) : ''

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value

          // Allow empty string
          if (value === '') {
            field.onChange(null)
            return
          }

          // Only allow numbers
          if (!/^\d+$/.test(value)) {
            return
          }

          const numValue = parseInt(value, 10)

          // Validate range 0-400 lbs
          if (numValue >= 0 && numValue <= 400) {
            field.onChange(numValue)
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
                inputMode="numeric"
                placeholder={placeholder}
                value={displayValue}
                onChange={handleChange}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-sm text-gray-500">lbs</span>
              </div>
            </div>
          </FormFieldWrapper>
        )
      }}
    />
  )
}

// Memoized with proper generic typing
export const WeightInput = React.memo(
  WeightInputInner
) as typeof WeightInputInner
