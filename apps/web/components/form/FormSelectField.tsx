import * as React from 'react'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { FormFieldWrapper } from './FormFieldWrapper'

export interface SelectOption {
  value: string
  label: string
}

export interface FormSelectFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  required?: boolean
  placeholder?: string
  description?: string
  options: SelectOption[]
  /**
   * Field width constraint. Use smaller widths for short selects.
   * - 'full': Full width (default)
   * - 'sm': Small (max-w-32) - for very short selects
   * - 'md': Medium (max-w-48) - for moderate selects
   * - 'lg': Large (max-w-md) - for longer selects
   */
  fieldWidth?: 'full' | 'sm' | 'md' | 'lg'
}

function FormSelectFieldInner<T extends FieldValues>({
  control,
  name,
  label,
  required,
  placeholder,
  description,
  options,
  fieldWidth = 'full',
}: FormSelectFieldProps<T>) {
  const widthClass = {
    full: 'w-full',
    sm: 'w-full max-w-32',
    md: 'w-full max-w-48',
    lg: 'w-full max-w-md',
  }[fieldWidth]

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormFieldWrapper
          label={label}
          required={required}
          error={fieldState.error?.message}
          description={description}
        >
          <Select onValueChange={field.onChange} value={field.value ?? ''}>
            <SelectTrigger className={widthClass}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
      )}
    />
  )
}

// Memoized with proper generic typing
export const FormSelectField = React.memo(
  FormSelectFieldInner
) as typeof FormSelectFieldInner
