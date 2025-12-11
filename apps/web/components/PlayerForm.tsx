'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldSet,
  FieldLegend,
  FieldGroup,
  FieldError,
} from '@workspace/ui/components/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Textarea } from '@workspace/ui/components/textarea'
import { Card } from '@workspace/ui/components/card'
import type { Player } from '@/payload-types'
import { isValidPosition } from '@/types/positions'

interface PlayerFormProps {
  profile?: Player
  mode?: 'create' | 'edit'
}

export function PlayerForm({ profile, mode = 'create' }: PlayerFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null | undefined>(
    profile?.profileImage && typeof profile.profileImage === 'object'
      ? profile.profileImage.url
      : null
  )

  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    graduationYear: profile?.graduationYear?.toString() || '',
    city: profile?.city || '',
    state: profile?.state || '',
    highSchool: profile?.highSchool || '',
    height: profile?.height || '',
    weightedGpa: profile?.weightedGpa?.toString() || '',
    unweightedGpa: profile?.unweightedGpa?.toString() || '',
    primaryPosition: profile?.primaryPosition || '',
    secondaryPosition: profile?.secondaryPosition || '',
    bio: profile?.bio || '',
    highlightVideo: profile?.highlightVideo || '',
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImageFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const url =
        mode === 'edit'
          ? `/api/profile/player/${profile?.id}`
          : '/api/profile/player'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      // Create FormData for file upload
      const formDataToSend = new FormData()

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value)
        }
      })

      // Add profile image if selected
      if (profileImageFile) {
        formDataToSend.append('profileImage', profileImageFile)
      }

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(
          data.error ||
            `Failed to ${mode === 'edit' ? 'update' : 'create'} profile`,
        )
      }

      if (mode === 'edit') {
        startTransition(() => {
          router.push('/')
          router.refresh()
        })
      } else {
        router.push('/')
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
    <Card className='bg-slate-800/50 border-slate-700 p-8 max-w-md mx-auto'>
      <form onSubmit={handleSubmit}>
        <FieldSet>
          <FieldLegend className='mb-6'>Player Profile</FieldLegend>
          {error && <FieldError className='mb-6'>{error}</FieldError>}
          <FieldGroup>
            {/* Profile Image Upload */}
            <Field className='gap-1'>
              <FieldLabel htmlFor='profileImage'>Profile Photo</FieldLabel>
              <div className='flex items-center gap-4'>
                {profileImagePreview && (
                  <div className='w-20 h-20 rounded-full overflow-hidden bg-slate-700 relative flex-shrink-0'>
                    <Image
                      src={profileImagePreview}
                      alt='Profile preview'
                      fill
                      className='object-cover'
                    />
                  </div>
                )}
                <Input
                  id='profileImage'
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                  className='flex-1'
                />
              </div>
              <FieldDescription>
                Upload a profile photo (JPG, PNG, or GIF)
              </FieldDescription>
            </Field>

            <div className='grid grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='firstName'>First Name</FieldLabel>
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
                <FieldLabel htmlFor='lastName'>Last Name</FieldLabel>
                <Input
                  id='lastName'
                  name='lastName'
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder='Required'
                />
              </Field>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='graduationYear'>Graduation Year</FieldLabel>
                <Input
                  id='graduationYear'
                  name='graduationYear'
                  type='number'
                  value={formData.graduationYear}
                  onChange={handleChange}
                  required
                  placeholder='2026'
                />
              </Field>
              <Field className='gap-1'>
                <FieldLabel htmlFor='height'>Height</FieldLabel>
                <Input
                  id='height'
                  name='height'
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="5'10&quot;"
                />
                <FieldDescription>Enter height in feet and inches.</FieldDescription>
              </Field>
            </div>

            <Field className='gap-1'>
              <FieldLabel htmlFor='highSchool'>High School</FieldLabel>
              <Input
                id='highSchool'
                name='highSchool'
                value={formData.highSchool}
                onChange={handleChange}
                required
                placeholder='Required'
              />
            </Field>

            <div className='grid grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='city'>City</FieldLabel>
                <Input
                  id='city'
                  name='city'
                  value={formData.city}
                  onChange={handleChange}
                  placeholder='City'
                />
              </Field>
              <Field className='gap-1'>
                <FieldLabel htmlFor='state'>State</FieldLabel>
                <Input
                  id='state'
                  name='state'
                  value={formData.state}
                  onChange={handleChange}
                  placeholder='CA'
                />
              </Field>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='primaryPosition'>Primary Position</FieldLabel>
                <Select
                  value={formData.primaryPosition}
                  onValueChange={(value) => {
                    if (isValidPosition(value)) {
                      setFormData((prev) => ({ ...prev, primaryPosition: value }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select position' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='point-guard'>Point Guard</SelectItem>
                    <SelectItem value='shooting-guard'>Shooting Guard</SelectItem>
                    <SelectItem value='small-forward'>Small Forward</SelectItem>
                    <SelectItem value='power-forward'>Power Forward</SelectItem>
                    <SelectItem value='center'>Center</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field className='gap-1'>
                <FieldLabel htmlFor='secondaryPosition'>Secondary Position</FieldLabel>
                <Select
                  value={formData.secondaryPosition}
                  onValueChange={(value) => {
                    if (isValidPosition(value)) {
                      setFormData((prev) => ({ ...prev, secondaryPosition: value }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select position' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='point-guard'>Point Guard</SelectItem>
                    <SelectItem value='shooting-guard'>Shooting Guard</SelectItem>
                    <SelectItem value='small-forward'>Small Forward</SelectItem>
                    <SelectItem value='power-forward'>Power Forward</SelectItem>
                    <SelectItem value='center'>Center</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='weightedGpa'>Weighted GPA</FieldLabel>
                <Input
                  id='weightedGpa'
                  name='weightedGpa'
                  type='number'
                  step='0.01'
                  value={formData.weightedGpa}
                  onChange={handleChange}
                  placeholder='4.0'
                />
              </Field>
              <Field className='gap-1'>
                <FieldLabel htmlFor='unweightedGpa'>Unweighted GPA</FieldLabel>
                <Input
                  id='unweightedGpa'
                  name='unweightedGpa'
                  type='number'
                  step='0.01'
                  value={formData.unweightedGpa}
                  onChange={handleChange}
                  placeholder='3.8'
                />
              </Field>
            </div>

            <Field className='gap-1'>
              <FieldLabel htmlFor='bio'>About You</FieldLabel>
              <Textarea
                id='bio'
                name='bio'
                value={formData.bio}
                onChange={handleChange}
                placeholder='Tell coaches about your playing style, achievements, and goals...'
                rows={4}
              />
              <FieldDescription>Tell coaches about your playing style and goals.</FieldDescription>
            </Field>

            <Field className='gap-1'>
              <FieldLabel htmlFor='highlightVideo'>Highlight Video URL</FieldLabel>
              <Input
                id='highlightVideo'
                name='highlightVideo'
                type='url'
                value={formData.highlightVideo}
                onChange={handleChange}
                placeholder='https://youtube.com/...'
              />
              <FieldDescription>Link to your highlight reel on YouTube, Hudl, etc.</FieldDescription>
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
