'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { AlertCircle } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { getGraduationYearOptions } from '@/lib/zod/GraduationYears'
import { US_STATES_AND_TERRITORIES } from '@/lib/zod/States'
import { PlayerBasicInfoSchema } from '@/lib/zod/PlayerSteps'
import { useSchemaForm } from '@/hooks/useSchemaForm'
import { FormTextField } from '@/components/form/FormTextField'
import { FormSelectField } from '@/components/form/FormSelectField'
import { ProfileImageUpload } from '@/components/form/ProfileImageUpload'
import type { Player } from '@/payload-types'
import { H2, P } from '../ui/typography'

interface PlayerBasicInfoStepProps {
  onSave: (data: any) => Promise<void>
  error: string | null
  isLastStep: boolean
  profile?: Partial<Player> | null
}

export function PlayerBasicInfoStep({
  onSave,
  error,
  isLastStep,
  profile,
}: PlayerBasicInfoStepProps) {
  const { user } = useUser()
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)

  // Get profile image URL
  const profileImageUrl = profile?.profileImageUrl || null

  const form = useSchemaForm({
    defaultValues: {
      graduationYear: profile?.graduationYear || '',
      highSchool: profile?.highSchool || '',
      city: profile?.city || '',
      state: profile?.state || '',
    },
    schema: PlayerBasicInfoSchema,
    fileFields: {
      profileImage: {
        file: profileImageFile,
        existingUrl: profileImageUrl || undefined,
      },
    },
    onSubmit: async (formData) => {
      // Add Clerk user info to FormData
      if (formData instanceof FormData) {
        if (user?.firstName) formData.append('firstName', user.firstName)
        if (user?.lastName) formData.append('lastName', user.lastName)
        if (user?.primaryEmailAddress?.emailAddress) {
          formData.append('email', user.primaryEmailAddress.emailAddress)
        }
      }
      await onSave(formData)
    },
  })

  if (!user) {
    return null
  }

  const isLoading = form.isSubmitting

  return (
    <form onSubmit={form.handleSubmit} className='space-y-6'>
      <div>
        <H2>
          Let&apos;s start with the basics
        </H2>
        <P>
          Tell us about yourself so coaches can find you
        </P>
      </div>

        {(error || form.error) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || form.error}</AlertDescription>
          </Alert>
        )}

        <ProfileImageUpload
          label='Player Photo'
          required
          initialImageUrl={profileImageUrl}
          onImageChange={setProfileImageFile}
          userType='player'
        />

        <div className='space-y-5'>
          <div className='grid grid-cols-2 gap-5'>
            <FormSelectField
              control={form.control}
              name='graduationYear'
              label='Graduation Year'
              required
              placeholder='Select year'
              options={getGraduationYearOptions()}
            />
            <FormTextField
              control={form.control}
              name='highSchool'
              label='High School'
              required
              placeholder='High School Name'
            />
          </div>

          <div className='grid grid-cols-2 gap-5'>
            <FormTextField
              control={form.control}
              name='city'
              label='City'
              required
              placeholder='City'
            />
            <FormSelectField
              control={form.control}
              name='state'
              label='State'
              required
              placeholder='Select state'
              options={US_STATES_AND_TERRITORIES.map(state => ({
                value: state.value,
                label: state.label,
              }))}
            />
          </div>
        </div>

      {/* Navigation */}
      <div className='flex justify-end gap-3 pt-6 border-t'>
        <Button
          type='submit'
          disabled={isLoading}
          className='bg-blue-600 hover:bg-blue-700'
        >
          {isLoading
            ? 'Saving...'
            : isLastStep
              ? 'Complete Profile'
              : 'Save & Continue'}
        </Button>
      </div>
    </form>
  )
}
