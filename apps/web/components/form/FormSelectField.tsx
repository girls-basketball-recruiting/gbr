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
}

function FormSelectFieldInner<T extends FieldValues>({
  control,
  name,
  label,
  required,
  placeholder,
  description,
  options,
}: FormSelectFieldProps<T>) {
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
            <SelectTrigger>
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
