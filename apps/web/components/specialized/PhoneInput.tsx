import * as React from 'react'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import { Input } from '@workspace/ui/components/input'
import { FormFieldWrapper } from '@/components/form/FormFieldWrapper'
import { formatPhoneNumber } from '@/lib/formatters'

export interface PhoneInputProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  required?: boolean
  placeholder?: string
  description?: string
}

// Extract just the digits from formatted phone
function unformatPhoneNumber(value: string): string {
  return value.replace(/\D/g, '')
}

function PhoneInputInner<T extends FieldValues>({
  control,
  name,
  label = 'Phone Number',
  required,
  placeholder = '(555) 123-4567',
  description,
}: PhoneInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // Display formatted version
        const displayValue = field.value ? formatPhoneNumber(field.value) : ''

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value
          const digits = unformatPhoneNumber(value)

          // Limit to 10 digits
          if (digits.length <= 10) {
            // Store unformatted digits
            field.onChange(digits || null)
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
              type="tel"
              inputMode="tel"
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
export const PhoneInput = React.memo(PhoneInputInner) as typeof PhoneInputInner
