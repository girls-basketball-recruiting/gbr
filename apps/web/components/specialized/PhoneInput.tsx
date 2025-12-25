import * as React from 'react'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import { Input } from '@workspace/ui/components/input'
import { FormFieldWrapper } from '@/components/form/FormFieldWrapper'

export interface PhoneInputProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  required?: boolean
  placeholder?: string
  description?: string
}

// Format phone number as (XXX) XXX-XXXX
function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '')

  // Format based on length
  if (digits.length <= 3) {
    return digits
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }
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
