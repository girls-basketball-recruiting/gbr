'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import {
  Field,
  FieldLabel,
  FieldSet,
  FieldLegend,
  FieldGroup,
  FieldError,
} from '@workspace/ui/components/field'
import { Card } from '@workspace/ui/components/card'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { AlertCircle } from 'lucide-react'
import { CollegeCombobox } from '@/components/CollegeCombobox'
import { ProfileImageUpload } from '@/components/form/ProfileImageUpload'
import { FormTextField } from '@/components/form/FormTextField'
import { FormTextareaField } from '@/components/form/FormTextareaField'
import { FormSelectField } from '@/components/form/FormSelectField'
import { PhoneInput } from '@/components/specialized/PhoneInput'
import { useSchemaForm } from '@/hooks/useSchemaForm'
import { CoachProfileSchema, type CoachProfileFormData, mapCoachToFormData } from '@/lib/zod/CoachProfile'
import { ACTIVE_COACH_POSITIONS } from '@/lib/zod/CoachPositions'
import type { Coach } from '@/payload-types'

interface CoachFormProps {
  profile?: Coach
  mode?: 'create' | 'edit'
  initialFirstName?: string
  initialLastName?: string
}

export function CoachForm({ profile, mode = 'create', initialFirstName, initialLastName }: CoachFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)

  // Default values for form
  const defaultValues: CoachProfileFormData = profile
    ? mapCoachToFormData(profile)
    : {
        firstName: initialFirstName || '',
        lastName: initialLastName || '',
        collegeId: 0,
        collegeName: '',
        city: '',
        state: '',
        jobTitle: '',
        phone: '',
        bio: '',
      }

  // Use the new schema form hook
  const form = useSchemaForm({
    defaultValues,
    schema: CoachProfileSchema,
    fileFields: {
      profileImageUrl: {
        file: profileImageFile,
        existingUrl: profile?.profileImageUrl ?? undefined,
      },
    },
    onSubmit: async formData => {
      const url =
        mode === 'edit' ? `/api/coaches/${profile?.id}/details` : '/api/coaches/list'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        // FormData is handled automatically by hook when file is present
        body: formData as BodyInit,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to ${mode === 'edit' ? 'update' : 'create'} profile`
        )
      }

      // Success - navigate to home
      if (mode === 'edit') {
        startTransition(() => {
          router.push('/')
          router.refresh()
        })
      } else {
        // For profile creation, do a hard navigation to bypass cache
        window.location.href = '/'
      }
    },
  })

  const isLoading = form.isSubmitting || isPending

  return (
    <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-8'>
      <form onSubmit={form.handleSubmit}>
        <FieldSet>
          <FieldLegend className='mb-6'>Coach Profile</FieldLegend>

          {/* Error Alert */}
          {form.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{form.error}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <ProfileImageUpload
              label='Coach Photo'
              description='Upload a coach photo (JPG, PNG, or GIF)'
              initialImageUrl={profile?.profileImageUrl}
              onImageChange={setProfileImageFile}
              userType='coach'
            />

            <div className='grid md:grid-cols-2 gap-5'>
              <FormTextField
                control={form.control}
                name='firstName'
                label='First Name'
                required
                placeholder='Required'
                fieldWidth='md'
              />

              <FormTextField
                control={form.control}
                name='lastName'
                label='Last Name'
                required
                placeholder='Required'
                fieldWidth='md'
              />
            </div>

            <Field className='gap-1'>
              <FieldLabel htmlFor='college'>
                College
                <span className='ml-1 text-red-500'>*</span>
              </FieldLabel>
              <CollegeCombobox
                value={form.watch('collegeName')}
                onSelect={college => {
                  if (college) {
                    form.setValue('collegeId', college.id)
                    form.setValue('collegeName', college.school)
                    form.setValue('city', college.city)
                    form.setValue('state', college.state)
                  } else {
                    form.setValue('collegeId', 0)
                    form.setValue('collegeName', '')
                    form.setValue('city', '')
                    form.setValue('state', '')
                  }
                }}
                placeholder='Search for your college...'
              />
              {form.formState.isSubmitted && form.watch('collegeId') === 0 && (
                <FieldError>Please select a college from the list</FieldError>
              )}
            </Field>

            <div className='grid md:grid-cols-2 gap-5'>
              <FormSelectField
                control={form.control}
                name='jobTitle'
                label='Position'
                required
                placeholder='Select position'
                fieldWidth='lg'
                options={ACTIVE_COACH_POSITIONS.map(pos => ({
                  value: pos.value,
                  label: pos.label,
                }))}
              />

              <PhoneInput
                control={form.control}
                name='phone'
                placeholder='(555) 555-5555'
              />
            </div>

            <FormTextareaField
              control={form.control}
              name='bio'
              label='About Your Program'
              placeholder="Tell players about your coaching philosophy, program culture, and what you're looking for in recruits..."
              rows={4}
            />

            <div className='flex gap-3 pt-2'>
              <Button
                type='submit'
                disabled={isLoading}
                className='flex-1 bg-blue-600 hover:bg-blue-700'
              >
                {isLoading
                  ? mode === 'edit'
                    ? 'Saving...'
                    : 'Creating Profile...'
                  : mode === 'edit'
                    ? 'Save Changes'
                    : 'Complete Profile'}
              </Button>
              {mode === 'edit' && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => startTransition(() => router.push('/'))}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </FieldGroup>
        </FieldSet>
      </form>
    </Card>
  )
}
