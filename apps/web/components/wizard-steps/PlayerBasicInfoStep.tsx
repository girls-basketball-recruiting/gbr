'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel, FieldError } from '@workspace/ui/components/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Card } from '@workspace/ui/components/card'
import { getPositionOptions } from '@/lib/zod/Positions'
import { getGraduationYearOptions } from '@/lib/zod/GraduationYears'
import { US_STATES_AND_TERRITORIES } from '@/lib/zod/States'
import { HeightSelect } from '@/components/HeightSelect'
import { useUser } from '@clerk/nextjs'
import { ProfileImageUpload } from '../ui/ProfileImageUpload'

interface PlayerBasicInfoStepProps {
  onNext: (data: any) => Promise<void>
  onBack: () => void
  error: string | null
}

export function PlayerBasicInfoStep({
  onNext,
  error,
}: PlayerBasicInfoStepProps) {
  const {user} = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    graduationYear: '',
    primaryPosition: '',
    secondaryPosition: '',
    heightInInches: 0,
    weight: '',
    highSchool: '',
    city: '',
    state: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!user) return

    try {
      const formDataToSend = new FormData()

      // Add user info from Clerk
      if (user.firstName) formDataToSend.append('firstName', user.firstName)
      if (user.lastName) formDataToSend.append('lastName', user.lastName)
      if (user.primaryEmailAddress?.emailAddress) {
        formDataToSend.append('email', user.primaryEmailAddress.emailAddress)
      }

      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, String(value))
        }
      })

      if (profileImageFile) {
        formDataToSend.append('profileImage', profileImageFile)
      }

      await onNext(formDataToSend)
    } catch {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-8'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
            Let&apos;s start with the basics
          </h2>
          <p className='text-slate-600 dark:text-slate-400'>
            Tell us about yourself so coaches can find you
          </p>
        </div>

        {error && <FieldError>{error}</FieldError>}

        <ProfileImageUpload
          label='Player Photo'
          initialImageUrl={undefined}
          onImageChange={setProfileImageFile}
          userType='player'
        />

        {/* Name */}
        <div className='grid grid-cols-2 gap-4'>
          <Field className='gap-1'>
            <FieldLabel htmlFor='firstName'>First Name</FieldLabel>
            <p>{user.firstName}</p>
          </Field>
          <Field className='gap-1'>
            <FieldLabel htmlFor='lastName'>Last Name</FieldLabel>
            <p>{user.lastName}</p>
          </Field>
        </div>

        {/* Graduation Year & Height/Weight */}
        <div className='grid grid-cols-2 gap-4'>
          <Field className='gap-1'>
            <FieldLabel htmlFor='graduationYear'>Graduation Year *</FieldLabel>
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
          <div className='grid grid-cols-2 gap-2'>
            <Field className='gap-1'>
              <FieldLabel>Height</FieldLabel>
              <HeightSelect
                value={formData.heightInInches || undefined}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, heightInInches: value }))}
              />
            </Field>
            <Field className='gap-1'>
              <FieldLabel htmlFor='weight'>Weight (lbs)</FieldLabel>
              <Input
                id='weight'
                name='weight'
                type='number'
                value={formData.weight}
                onChange={handleChange}
                placeholder='lbs'
              />
            </Field>
          </div>
        </div>

        {/* Positions */}
        <div className='grid grid-cols-2 gap-4'>
          <Field className='gap-1'>
            <FieldLabel htmlFor='primaryPosition'>Primary Position *</FieldLabel>
            <Select
              value={formData.primaryPosition}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, primaryPosition: value }))
              }
              required
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
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, secondaryPosition: value }))
              }
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

        {/* High School */}
        <Field className='gap-1'>
          <FieldLabel htmlFor='highSchool'>High School *</FieldLabel>
          <Input
            id='highSchool'
            name='highSchool'
            value={formData.highSchool}
            onChange={handleChange}
            required
            placeholder='Required'
          />
        </Field>

        {/* Location */}
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
              onValueChange={(value) => setFormData((prev) => ({ ...prev, state: value }))}
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

        {/* Navigation */}
        <div className='flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700'>
          <Button type='submit' disabled={isSubmitting} className='bg-blue-600 hover:bg-blue-700'>
            {isSubmitting ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
