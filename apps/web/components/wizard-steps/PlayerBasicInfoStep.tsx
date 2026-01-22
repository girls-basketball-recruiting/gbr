'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { AlertCircle, Info } from 'lucide-react'
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
  initialFirstName?: string
  initialLastName?: string
  initialEmail?: string
}

export function PlayerBasicInfoStep({
  onSave,
  error,
  isLastStep,
  profile,
  initialFirstName,
  initialLastName,
  initialEmail,
}: PlayerBasicInfoStepProps) {
  const { user } = useUser()
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)

  // Get profile image URL
  const profileImageUrl = profile?.profileImageUrl || null

  const form = useSchemaForm({
    defaultValues: {
      firstName: profile?.firstName || initialFirstName || '',
      lastName: profile?.lastName || initialLastName || '',
      graduationYear: profile?.graduationYear || '',
      highSchool: profile?.highSchool || '',
      schoolTeamScheduleUrl: profile?.schoolTeamScheduleUrl || '',
      city: profile?.city || '',
      state: profile?.state || '',
      phoneNumber: profile?.phoneNumber || '',
      xHandle: profile?.xHandle || '',
      instaHandle: profile?.instaHandle || '',
      tiktokHandle: profile?.tiktokHandle || '',
    },
    schema: PlayerBasicInfoSchema,
    fileFields: {
      profileImage: {
        file: profileImageFile,
        existingUrl: profileImageUrl || undefined,
      },
    },
    onSubmit: async (formData) => {
      // Add email (prefer server-provided initialEmail, fallback to client-side Clerk)
      if (formData instanceof FormData) {
        const email = initialEmail || user?.primaryEmailAddress?.emailAddress
        if (email) {
          formData.append('email', email)
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
            <FormTextField
              control={form.control}
              name='firstName'
              label='First Name'
              required
              placeholder='First name'
            />
            <FormTextField
              control={form.control}
              name='lastName'
              label='Last Name'
              required
              placeholder='Last name'
            />
          </div>

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

          <FormTextField
            control={form.control}
            name='schoolTeamScheduleUrl'
            label='School Team Schedule URL'
            placeholder='https://maxpreps.com/...'
          />

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

          {/* Contact Information */}
          <div className='pt-6 border-t space-y-4'>
            <div>
              <h3 className='text-base font-semibold mb-1'>Contact Information</h3>
              <Alert className='bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'>
                <Info className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                <AlertDescription className='text-blue-800 dark:text-blue-200'>
                  Your contact information is only visible to registered coaches from college programs. Other players cannot see this information.
                </AlertDescription>
              </Alert>
            </div>

            <div className='grid grid-cols-2 gap-5'>
              <FormTextField
                control={form.control}
                name='phoneNumber'
                label='Phone Number'
                placeholder='(555) 555-5555'
              />
              <FormTextField
                control={form.control}
                name='xHandle'
                label='X (Twitter) Handle'
                placeholder='@username'
              />
            </div>

            <div className='grid grid-cols-2 gap-5'>
              <FormTextField
                control={form.control}
                name='instaHandle'
                label='Instagram Handle'
                placeholder='@username'
              />
              <FormTextField
                control={form.control}
                name='tiktokHandle'
                label='TikTok Handle'
                placeholder='@username'
              />
            </div>
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
