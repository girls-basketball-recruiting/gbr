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
import { isValidPosition, getPositionOptions } from '@/types/positions'
import { US_STATES_AND_TERRITORIES } from '@/types/states'
import { HeightSelect } from '@/components/HeightSelect'
import { getGraduationYearOptions } from '@/types/graduationYears'

interface PlayerFormProps {
  profile?: Player
  mode?: 'create' | 'edit'
  initialFirstName?: string
  initialLastName?: string
}

export function PlayerForm({
  profile,
  mode = 'create',
  initialFirstName,
  initialLastName,
}: PlayerFormProps) {
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

  // Convert height format from "5'10"" to "5-10" for consistency
  const normalizeHeight = (height: string | null | undefined) => {
    if (!height) return ''
    const match = height.match(/(\d+)'(\d+)"?/)
    if (match) {
      return `${match[1]}-${match[2]}`
    }
    return height
  }

  const [height, setHeight] = useState(normalizeHeight(profile?.height))

  // Initialize highlight video URLs from profile or start with one empty input
  const getInitialVideoUrls = () => {
    if (profile?.highlightVideoUrls && Array.isArray(profile.highlightVideoUrls) && profile.highlightVideoUrls.length > 0) {
      const urls = profile.highlightVideoUrls.map((item: any) =>
        typeof item === 'object' && item.url ? item.url : ''
      ).filter(url => url)
      return urls.length > 0 ? urls : ['']
    }
    return ['']
  }

  const [videoUrls, setVideoUrls] = useState<string[]>(getInitialVideoUrls())

  const [formData, setFormData] = useState({
    firstName: profile?.firstName || initialFirstName || '',
    lastName: profile?.lastName || initialLastName || '',
    graduationYear: profile?.graduationYear?.toString() || '',
    city: profile?.city || '',
    state: profile?.state || '',
    highSchool: profile?.highSchool || '',
    weightedGpa: profile?.weightedGpa?.toString() || '',
    unweightedGpa: profile?.unweightedGpa?.toString() || '',
    primaryPosition: profile?.primaryPosition || '',
    secondaryPosition: profile?.secondaryPosition || '',
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

  const handleVideoUrlChange = (index: number, value: string) => {
    const newUrls = [...videoUrls]
    newUrls[index] = value
    setVideoUrls(newUrls)
  }

  const addVideoUrl = () => {
    if (videoUrls.length < 10) {
      setVideoUrls([...videoUrls, ''])
    }
  }

  const removeVideoUrl = (index: number) => {
    if (videoUrls.length > 1) {
      setVideoUrls(videoUrls.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Frontend validation
    if (!formData.graduationYear) {
      setError('Please select a graduation year')
      setIsSubmitting(false)
      return
    }

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

      // Add height if set (convert from "5-10" to "5'10"" format)
      if (height) {
        const [feet, inches] = height.split('-')
        const formattedHeight = `${feet}'${inches || '0'}"`
        formDataToSend.append('height', formattedHeight)
      }

      // Add highlight video URLs as JSON
      const filteredUrls = videoUrls.filter((url) => url.trim())
      if (filteredUrls.length > 0) {
        formDataToSend.append('highlightVideoUrls', JSON.stringify(filteredUrls))
      }

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
              <FieldLabel htmlFor='profileImage'>Player Photo</FieldLabel>
              <div className='flex items-center gap-4'>
                {profileImagePreview && (
                  <div className='w-20 h-20 rounded-full overflow-hidden bg-slate-700 relative shrink-0'>
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
                Upload a player photo (JPG, PNG, or GIF)
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
                <FieldLabel htmlFor='graduationYear'>
                  Graduation Year <span className='text-red-500'>*</span>
                </FieldLabel>
                <Select
                  value={formData.graduationYear}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, graduationYear: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select year' />
                  </SelectTrigger>
                  <SelectContent>
                    {getGraduationYearOptions().map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field className='gap-1'>
                <FieldLabel>Height</FieldLabel>
                <HeightSelect value={height} onValueChange={setHeight} />
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
                <Select
                  value={formData.state}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, state: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select state' />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES_AND_TERRITORIES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {getPositionOptions().map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
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
                    {getPositionOptions().map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
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
            </Field>

            <Field className='gap-1'>
              <FieldLabel>Highlight Video URLs</FieldLabel>
              <div className='space-y-2'>
                {videoUrls.map((url, index) => (
                  <div key={index} className='flex gap-2'>
                    <Input
                      type='url'
                      value={url}
                      onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                      placeholder='https://youtube.com/... or https://hudl.com/...'
                      className='flex-1'
                    />
                    {videoUrls.length > 1 && (
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        onClick={() => removeVideoUrl(index)}
                        className='shrink-0'
                      >
                        ✕
                      </Button>
                    )}
                    {index === videoUrls.length - 1 && videoUrls.length < 10 && (
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        onClick={addVideoUrl}
                        className='shrink-0'
                      >
                        +
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <FieldDescription>
                Add up to 10 highlight video URLs (YouTube, Hudl, etc.)
              </FieldDescription>
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
