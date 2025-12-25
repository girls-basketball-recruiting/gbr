# Schema-Driven Forms Architecture

**Date:** 2025-12-26
**Status:** Approved
**Goal:** Create performant, schema-driven forms that eliminate duplication and bind to PayloadCMS collections

## Problem Statement

Current forms have multiple issues:
1. **Input lag when typing** - validation running on every keystroke
2. **Schema duplication** - PayloadCMS collections and Zod schemas maintained separately
3. **Code duplication** - Each form reimplements similar patterns
4. **Performance issues** - Non-memoized values, recreated handlers, unnecessary re-renders
5. **No single source of truth** - Forms not bound to collection schemas

## Design Decisions

### 1. PayloadCMS as Source of Truth

PayloadCMS collections (`collections/*.ts`) are the authoritative schema. Forms will:
- Use existing Zod schemas in `lib/zod/*.ts` for validation
- Extract metadata from PayloadCMS collections for field requirements
- Keep both schemas but build tooling to ensure consistency

### 2. Performance Strategy

**Form Validation:**
- Change from `mode: 'onTouched'` to `mode: 'onBlur'`
- Eliminates keystroke validation lag
- Validates only when user leaves field

**Memoization:**
- Use `hash` from `ohash` for dependency array deep equality
- Memoize event handlers with `useCallback`
- Memoize default values with `useMemo`
- Wrap form sections in `React.memo` with `ohash` comparison

**Colleges Data:**
- Fetch once on app load in root layout
- Cache in React Context with SWR
- Client-side filtering (exact text match, no fuzzy search library)
- Debounce search input (300ms)
- Limit results to 50 items

## Architecture

### Core Hook: `useSchemaForm`

Consolidates all form logic including file uploads:

```tsx
// hooks/useSchemaForm.ts
export function useSchemaForm<T>(options: {
  defaultValues: T
  onSubmit: (data: T | FormData) => Promise<void>
  schema: z.ZodSchema<T>
  fileFields?: {
    [K in keyof T]?: {
      file: File | null
      existingUrl?: string
    }
  }
}) {
  const memoizedDefaults = useMemo(
    () => options.defaultValues,
    [hash(options.defaultValues)]
  )

  const form = useForm<T>({
    resolver: zodResolver(options.schema),
    defaultValues: memoizedDefaults,
    mode: 'onBlur', // No validation on keystroke
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true)
    setError(null)
    try {
      // Auto-detect: use FormData if files present
      if (fileFields && Object.values(fileFields).some(f => f?.file)) {
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

        // Append file fields
        Object.entries(fileFields).forEach(([key, field]) => {
          if (field?.file) {
            formData.append(key, field.file)
          }
        })

        await options.onSubmit(formData)
      } else {
        await options.onSubmit(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setIsSubmitting(false)
    }
  })

  return { ...form, handleSubmit, isSubmitting, error }
}
```

**Usage:**
```tsx
const [profileImage, setProfileImage] = useState<File | null>(null)

const form = useSchemaForm({
  defaultValues: profile,
  schema: CoachSchema,
  fileFields: {
    profileImageUrl: {
      file: profileImage,
      existingUrl: profile.profileImageUrl
    }
  },
  onSubmit: async (formData) => {
    await fetch('/api/coaches/123', {
      method: 'PUT',
      body: formData
    })
  }
})
```

### Enhanced Colleges Provider

```tsx
// contexts/colleges-provider.tsx
import { hash } from 'ohash'
import useSWR from 'swr'

export function CollegesProvider({ children }) {
  const { data: colleges, isLoading } = useSWR(
    '/api/colleges',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000 // 1 hour
    }
  )

  const searchColleges = useCallback((query: string) => {
    if (!query) return colleges
    const lower = query.toLowerCase()
    return colleges?.filter(c =>
      c.school.toLowerCase().includes(lower) ||
      c.city.toLowerCase().includes(lower) ||
      c.state.toLowerCase().includes(lower)
    )
  }, [hash(colleges)])

  return (
    <CollegesContext.Provider value={{ colleges, searchColleges, isLoading }}>
      {children}
    </CollegesContext.Provider>
  )
}

// hooks/useColleges.ts
export function useColleges() {
  const context = useContext(CollegesContext)
  if (!context) throw new Error('useColleges must be within CollegesProvider')
  return context
}
```

**Integration in root layout:**
```tsx
// app/(frontend)/layout.tsx
<CollegesProvider>
  <AuthenticatedLayout>
    {children}
  </AuthenticatedLayout>
</CollegesProvider>
```

### Reusable Form Components

**Base Wrapper:**
```tsx
// components/form/FormFieldWrapper.tsx
export function FormFieldWrapper({
  label,
  required,
  error,
  description,
  children
}: {
  label: string
  required?: boolean
  error?: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Field className="gap-1">
      <FieldLabel>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
```

**Form Field Components** (all memoized):

1. `FormTextField` - text/email inputs
2. `FormTextareaField` - multiline text
3. `FormSelectField` - dropdowns
4. `FormComboboxField` - searchable selects
5. `FormArrayField` - repeating fields

**Example:**
```tsx
// components/form/FormTextField.tsx
export const FormTextField = React.memo(({
  control,
  name,
  label,
  required,
  placeholder,
  type = 'text'
}: FormFieldProps) => (
  <Controller
    control={control}
    name={name}
    render={({ field, fieldState }) => (
      <FormFieldWrapper
        label={label}
        required={required}
        error={fieldState.error?.message}
      >
        <Input {...field} type={type} placeholder={placeholder} />
      </FormFieldWrapper>
    )}
  />
))
```

### Specialized Input Components

**NO raw number inputs** - all use text with validation for better UX:

1. `WeightInput` - validates 0-400 lbs, shows suffix
2. `GpaInput` - validates 0.0-5.0, 2 decimals
3. `StatsInput` - validates PPG/RPG/APG decimals
4. `PhoneInput` - phone formatting/validation
5. `GraduationYearSelect` - dynamic year range dropdown
6. `HeightSelect` - already exists (feet/inches → total inches)

All convert to numbers internally but accept text input.

### Optimized CollegeCombobox

Updates:
- Add 300ms debounce on search input
- Limit visible results to 50 items
- Use colleges from context (no fetching)
- Memoize filtered results: `useMemo(() => searchColleges(query), [hash(query), hash(colleges)])`

## File Structure

### New Files

```
lib/
  schema-helpers.ts          # Extract metadata from Payload collections

hooks/
  useSchemaForm.ts           # Consolidated form logic + file uploads
  useColleges.ts             # Access colleges context

components/form/
  FormFieldWrapper.tsx       # Base wrapper (labels, errors, descriptions)
  FormTextField.tsx          # Text/email inputs
  FormTextareaField.tsx      # Multiline text
  FormSelectField.tsx        # Dropdowns
  FormComboboxField.tsx      # Searchable selects
  FormArrayField.tsx         # Repeating fields (awards, videos)

components/specialized/
  WeightInput.tsx            # Weight with validation
  GpaInput.tsx               # GPA with validation
  StatsInput.tsx             # PPG/RPG/APG
  PhoneInput.tsx             # Phone formatting
  GraduationYearSelect.tsx   # Dynamic year range
```

### Files to Refactor

- `contexts/colleges-provider.tsx` - Add memoization + SWR
- `components/CollegeCombobox.tsx` - Add debounce, limit results
- `components/PlayerEditTabs.tsx` - Use new hooks/components
- `components/CoachForm.tsx` - Use new hooks/components
- `components/CoachEditForm.tsx` - Use new hooks/components
- `components/ProspectForm.tsx` - Use new hooks/components

## Implementation Order

1. **Enhance colleges provider** - Add to root layout with SWR
2. **Create useSchemaForm hook** - Core form logic consolidation
3. **Create basic form components** - TextField, Textarea, Select, etc
4. **Create specialized inputs** - Weight, GPA, Stats, Phone, etc
5. **Optimize CollegeCombobox** - Debounce, memoization
6. **Refactor CoachForm** - Smallest form, use as template
7. **Refactor remaining forms** - Apply pattern to Player, Prospect forms

## Performance Guarantees

After implementation:

✅ **No input lag** - validation only on blur
✅ **No unnecessary re-renders** - memoization with `ohash`
✅ **No colleges refetching** - cached in context with SWR
✅ **Fast combobox** - debounced, limited results
✅ **Stable event handlers** - all wrapped in `useCallback`
✅ **Deep equality checks** - using `hash()` in dependency arrays

## Success Criteria

1. Forms validate on blur, not keystroke
2. Typing in any input feels instant (no lag)
3. All forms use `useSchemaForm` hook
4. Colleges fetched once per session
5. CollegeCombobox has debounce and result limit
6. No duplicated form logic across components
7. All event handlers properly memoized
8. Profile image uploads integrated into form hook

## Future Enhancements (Out of Scope)

- Auto-generate Zod schemas from PayloadCMS collections
- Add field-level permissions from PayloadCMS
- Virtual scrolling for long lists
- Fuzzy search for colleges (if needed)
