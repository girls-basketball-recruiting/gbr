import { useState, useMemo } from 'react'
import { useForm, FieldValues, DefaultValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { hash } from 'ohash'

export interface FileField {
  file: File | null
  existingUrl?: string
}

export interface UseSchemaFormOptions<T extends FieldValues> {
  defaultValues: T
  schema: any // Using any to avoid zod version compatibility issues with zodResolver
  onSubmit: (data: T | FormData) => Promise<void>
  /**
   * File fields to include in FormData.
   * Keys don't need to match form fields - allows arbitrary file uploads.
   */
  fileFields?: {
    [key: string]: FileField
  }
}

export function useSchemaForm<T extends FieldValues>({
  defaultValues,
  schema,
  onSubmit,
  fileFields,
}: UseSchemaFormOptions<T>) {
  // Memoize default values using ohash for deep equality
  const memoizedDefaults = useMemo(
    () => defaultValues as DefaultValues<T>,
    // Using hash for deep equality comparison
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hash(defaultValues)]
  )

  // Initialize form with onBlur validation mode (no keystroke lag)
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: memoizedDefaults,
    mode: 'onBlur', // CRITICAL: Validates only on blur, not on keystroke
    reValidateMode: 'onChange', // Re-validate on change after first validation
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Wrapped submit handler with auto-detection of file uploads
  // NOTE: react-hook-form automatically validates ALL fields before calling this function
  // If validation fails, this function is never called and errors appear inline
  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Use FormData if fileFields is defined (even if no file selected)
      // This ensures API routes can consistently expect FormData
      if (fileFields) {
        const formData = new FormData()

        // Append all form fields
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value))
            } else if (typeof value === 'object') {
              formData.append(key, JSON.stringify(value))
            } else {
              formData.append(key, String(value))
            }
          }
        })

        // Append file fields (only if file exists)
        Object.entries(fileFields).forEach(([key, field]) => {
          if (field?.file) {
            formData.append(key, field.file)
          }
        })

        await onSubmit(formData)
      } else {
        await onSubmit(data as T)
      }
    } catch (err) {
      // Set error but DO NOT reset form - form state is preserved
      setError(err instanceof Error ? err.message : 'Submission failed')
      // Don't re-throw - let the error display in the form
    } finally {
      setIsSubmitting(false)
    }
  })

  return {
    ...form,
    handleSubmit,
    isSubmitting,
    error,
  }
}
