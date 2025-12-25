'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  Field,
  FieldLabel,
  FieldSet,
  FieldLegend,
  FieldGroup,
  FieldError,
} from '@workspace/ui/components/field'
import { Textarea } from '@workspace/ui/components/textarea'
import { Card } from '@workspace/ui/components/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { CollegeCombobox } from '@/components/CollegeCombobox'
import type { Coach } from '@/payload-types'
import { ACTIVE_COACH_POSITIONS } from '@/lib/zod/CoachPositions'
import { ProfileImageUpload } from '@/components/ui/ProfileImageUpload'

interface CoachFormProps {
  profile?: Coach
  mode?: 'create' | 'edit'
  initialFirstName?: string
  initialLastName?: string
}

export function CoachForm({
  profile,
  mode = 'create',
}: CoachFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    collegeId: profile?.collegeId || 0,
    collegeName: profile?.collegeName || '',
    jobTitle: profile?.jobTitle || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const url =
        mode === 'edit'
          ? `/api/coaches/${profile?.id}`
          : '/api/coaches'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const formDataToSend = new FormData()
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value.toString())
        }
      })

      if (profileImageFile) {
        formDataToSend.append('profileImage', profileImageFile)
      }

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to ${mode === 'edit' ? 'update' : 'create'} profile`,
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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${mode === 'edit' ? 'update' : 'create'} profile`,
      )
      setIsSubmitting(false)
    }
  }

  const isLoading = isSubmitting || isPending

  return (
    <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-8 max-w-md mx-auto'>
      <form onSubmit={handleSubmit}>
        <FieldSet>
          <FieldLegend className='mb-6'>Coach Profile</FieldLegend>
          {error && <FieldError className='mb-6'>{error}</FieldError>}
          <FieldGroup>
            <ProfileImageUpload
              label='Coach Photo'
              description='Upload a coach photo (JPG, PNG, or GIF)'
              initialImageUrl={profile?.profileImageUrl}
              onImageChange={setProfileImageFile}
              userType='coach'
            />

            <Field className='gap-1'>
              <FieldLabel htmlFor='name'>First Name</FieldLabel>
              <Input
                id='firstName'
                name='firstName'
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder='Required'
              />
            </Field>

            <Field className='gap-1'>
              <FieldLabel htmlFor='name'>Last Name</FieldLabel>
              <Input
                id='lastName'
                name='lastName'
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder='Required'
              />
            </Field>

            <Field className='gap-1'>
              <FieldLabel htmlFor='college'>College</FieldLabel>
              <CollegeCombobox
                value={formData.collegeName}
                onSelect={(college) => {
                  if (college) {
                    setFormData((prev) => ({
                      ...prev,
                      collegeId: college.id,
                      collegeName: college.school,
                    }))
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      collegeId: 0,
                      collegeName: '',
                    }))
                  }
                }}
                placeholder='Search for your college...'
                required
              />
              {formData.collegeId === 0 && (
                <FieldError>Please select a college from the list</FieldError>
              )}
            </Field>

            <Field className='gap-1'>
              <FieldLabel htmlFor='position'>Position</FieldLabel>
              <Select
                value={formData.jobTitle}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, jobTitle: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select position' />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVE_COACH_POSITIONS.map((position) => (
                    <SelectItem key={position.value} value={position.value}>
                      {position.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {/* <div className='grid grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='division'>Division</FieldLabel>
                <Select
                  value={formData.division}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, division: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select division' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='d1'>NCAA D1</SelectItem>
                    <SelectItem value='d2'>NCAA D2</SelectItem>
                    <SelectItem value='d3'>NCAA D3</SelectItem>
                    <SelectItem value='naia'>NAIA</SelectItem>
                    <SelectItem value='juco'>JUCO</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field className='gap-1'>
                <FieldLabel htmlFor='region'>Region</FieldLabel>
                <Select
                  value={formData.region}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, region: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select region' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='new-england'>New England</SelectItem>
                    <SelectItem value='mid-atlantic'>Mid-Atlantic</SelectItem>
                    <SelectItem value='southeast'>Southeast</SelectItem>
                    <SelectItem value='southwest'>Southwest</SelectItem>
                    <SelectItem value='midwest'>Midwest</SelectItem>
                    <SelectItem value='mountain-west'>Mountain West</SelectItem>
                    <SelectItem value='west-coast'>West Coast</SelectItem>
                    <SelectItem value='pacific-northwest'>
                      Pacific Northwest
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div> */}

            <div className='grid grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='phone'>Phone Number</FieldLabel>
                <Input
                  id='phone'
                  name='phone'
                  type='tel'
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder='(555) 555-5555'
                />
              </Field>
            </div>

            <Field className='gap-1'>
              <FieldLabel htmlFor='bio'>About Your Program</FieldLabel>
              <Textarea
                id='bio'
                name='bio'
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell players about your coaching philosophy, program culture, and what you're looking for in recruits..."
                rows={4}
              />
            </Field>

            <div className='flex gap-3'>
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
