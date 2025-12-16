'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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

interface CoachFormProps {
  profile?: Coach
  mode?: 'create' | 'edit'
  initialName?: string
}

export function CoachForm({
  profile,
  mode = 'create',
  initialName,
}: CoachFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: profile?.name || initialName || '',
    collegeId: profile?.collegeId || 0,
    collegeName: profile?.collegeName || '',
    programName: profile?.programName || '',
    position: profile?.position || '',
    email: profile?.email || '',
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
          ? `/api/profile/coach/${profile?.id}`
          : '/api/profile/coach'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
          <FieldLegend className='mb-6'>Coach Profile</FieldLegend>
          {error && <FieldError className='mb-6'>{error}</FieldError>}
          <FieldGroup>
            <Field className='gap-1'>
              <FieldLabel htmlFor='name'>Your Name</FieldLabel>
              <Input
                id='name'
                name='name'
                value={formData.name}
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

            <div className='grid grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='programName'>Program Name</FieldLabel>
                <Input
                  id='programName'
                  name='programName'
                  value={formData.programName}
                  onChange={handleChange}
                  placeholder="Women's Basketball"
                />
              </Field>
              <Field className='gap-1'>
                <FieldLabel htmlFor='position'>Position</FieldLabel>
                <Input
                  id='position'
                  name='position'
                  value={formData.position}
                  onChange={handleChange}
                  placeholder='Head Coach, etc.'
                />
              </Field>
            </div>

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
                <FieldLabel htmlFor='email'>Contact Email</FieldLabel>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='coach@university.edu'
                />
              </Field>
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
              <FieldDescription>
                Share your coaching philosophy and what you look for in recruits.
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
