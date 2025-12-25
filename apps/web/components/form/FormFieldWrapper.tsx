import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@workspace/ui/components/field'

export interface FormFieldWrapperProps {
  label: string
  required?: boolean
  error?: string
  description?: string
  children: React.ReactNode
}

export function FormFieldWrapper({
  label,
  required,
  error,
  description,
  children,
}: FormFieldWrapperProps) {
  return (
    <Field className="gap-1">
      <FieldLabel>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
