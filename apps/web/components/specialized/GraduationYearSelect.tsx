import * as React from 'react'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { FormFieldWrapper } from '@/components/form/FormFieldWrapper'

export interface GraduationYearSelectProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  required?: boolean
  placeholder?: string
  description?: string
  yearsAhead?: number // How many years into the future
  yearsBehind?: number // How many years into the past
}

function GraduationYearSelectInner<T extends FieldValues>({
  control,
  name,
  label = 'Graduation Year',
  required,
  placeholder = 'Select year',
  description,
  yearsAhead = 8, // Default: current year + 8 years (for high school students)
  yearsBehind = 2, // Default: current year - 2 years
}: GraduationYearSelectProps<T>) {
  // Generate year options dynamically
  const yearOptions = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    const startYear = currentYear - yearsBehind
    const endYear = currentYear + yearsAhead
    const years: number[] = []

    for (let year = startYear; year <= endYear; year++) {
      years.push(year)
    }

    return years.reverse() // Most recent first
  }, [yearsAhead, yearsBehind])

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
          <Select
            onValueChange={value => field.onChange(parseInt(value, 10))}
            value={field.value ? String(field.value) : ''}
          >
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map(year => (
                <SelectItem key={year} value={String(year)}>
                  {year}
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
export const GraduationYearSelect = React.memo(
  GraduationYearSelectInner
) as typeof GraduationYearSelectInner
