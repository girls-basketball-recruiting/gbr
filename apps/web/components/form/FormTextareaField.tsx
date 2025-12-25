import * as React from 'react'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import { Textarea } from '@workspace/ui/components/textarea'
import { FormFieldWrapper } from './FormFieldWrapper'

export interface FormTextareaFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  required?: boolean
  placeholder?: string
  description?: string
  rows?: number
}

function FormTextareaFieldInner<T extends FieldValues>({
  control,
  name,
  label,
  required,
  placeholder,
  description,
  rows = 4,
}: FormTextareaFieldProps<T>) {
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
          <Textarea
            {...field}
            placeholder={placeholder}
            rows={rows}
            value={field.value ?? ''}
          />
        </FormFieldWrapper>
      )}
    />
  )
}

// Memoized with proper generic typing
export const FormTextareaField = React.memo(
  FormTextareaFieldInner
) as typeof FormTextareaFieldInner
