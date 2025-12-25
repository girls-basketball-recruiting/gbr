'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel, FieldDescription, FieldError } from '@workspace/ui/components/field'
import { Card } from '@workspace/ui/components/card'

interface PlayerContactStepProps {
  onNext: (data: any) => Promise<void>
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
  error: string | null
}

export function PlayerContactStep({ onNext, onBack, error }: PlayerContactStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
    xHandle: '',
    instaHandle: '',
    ncaaId: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onNext(formData)
    } catch (err) {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-8'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
            Contact Information
          </h2>
          <p className='text-slate-600 dark:text-slate-400'>
            How can coaches reach you?
          </p>
        </div>

        {error && <FieldError>{error}</FieldError>}

        <Field className='gap-1'>
          <FieldLabel htmlFor='phoneNumber'>Phone Number</FieldLabel>
          <Input
            id='phoneNumber'
            name='phoneNumber'
            type='tel'
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder='(555) 123-4567'
          />
        </Field>

        <Field className='gap-1'>
          <FieldLabel htmlFor='email'>Email</FieldLabel>
          <Input
            id='email'
            name='email'
            type='email'
            value={formData.email}
            onChange={handleChange}
            placeholder='your.email@example.com'
          />
          <FieldDescription>Separate from your account email if needed</FieldDescription>
        </Field>

        <Field className='gap-1'>
          <FieldLabel htmlFor='xHandle'>X (Twitter) Handle</FieldLabel>
          <Input
            id='xHandle'
            name='xHandle'
            value={formData.xHandle}
            onChange={handleChange}
            placeholder='@yourhandle'
          />
        </Field>

        <Field className='gap-1'>
          <FieldLabel htmlFor='instaHandle'>Instagram Handle</FieldLabel>
          <Input
            id='instaHandle'
            name='instaHandle'
            value={formData.instaHandle}
            onChange={handleChange}
            placeholder='@yourhandle'
          />
        </Field>

        <Field className='gap-1'>
          <FieldLabel htmlFor='ncaaId'>NCAA Eligibility Center ID</FieldLabel>
          <Input
            id='ncaaId'
            name='ncaaId'
            value={formData.ncaaId}
            onChange={handleChange}
            placeholder='NCAA ID number'
          />
          <FieldDescription>
            If you've registered with the NCAA Eligibility Center
          </FieldDescription>
        </Field>

        <div className='flex justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-700'>
          <Button type='button' variant='outline' onClick={onBack}>
            Back
          </Button>
          <Button type='submit' disabled={isSubmitting} className='bg-blue-600 hover:bg-blue-700'>
            {isSubmitting ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
