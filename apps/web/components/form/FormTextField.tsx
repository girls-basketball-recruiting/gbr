import * as React from 'react'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import { Input } from '@workspace/ui/components/input'
import { FormFieldWrapper } from './FormFieldWrapper'

export interface FormTextFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  required?: boolean
  placeholder?: string
  description?: string
  type?: 'text' | 'email' | 'url' | 'tel'
}

function FormTextFieldInner<T extends FieldValues>({
  control,
  name,
  label,
  required,
  placeholder,
  description,
  type = 'text',
}: FormTextFieldProps<T>) {
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
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            value={field.value ?? ''}
          />
        </FormFieldWrapper>
      )}
    />
  )
}

// Memoized with proper generic typing
export const FormTextField = React.memo(
  FormTextFieldInner
) as typeof FormTextFieldInner
