'use client'

import { Control, FieldValues, Path } from 'react-hook-form'
import { FormFieldWrapper } from '@/components/form/FormFieldWrapper'
import { HeightSelect } from '@/components/HeightSelect'
import { Controller } from 'react-hook-form'

export interface HeightInputProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  required?: boolean
  description?: string
}

export function HeightInput<T extends FieldValues>({
  control,
  name,
  label = 'Height',
  required,
  description,
}: HeightInputProps<T>) {
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
          <HeightSelect
            value={field.value as number}
            onValueChange={field.onChange}
          />
        </FormFieldWrapper>
      )}
    />
  )
}
