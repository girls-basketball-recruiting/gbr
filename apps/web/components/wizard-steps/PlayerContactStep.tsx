'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel, FieldDescription, FieldError } from '@workspace/ui/components/field'

interface PlayerContactStepProps {
  onSave: (data: any) => Promise<void>
  error: string | null
  isLastStep: boolean
}

export function PlayerContactStep({ onSave, error, isLastStep }: PlayerContactStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    phoneNumber: '',
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
      await onSave(formData)
    } catch (err) {
      setIsSubmitting(false)
    }
  }

  return (
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

      <div className='flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700'>
        <Button type='submit' disabled={isSubmitting} className='bg-blue-600 hover:bg-blue-700'>
          {isSubmitting ? 'Saving...' : isLastStep ? 'Complete Profile' : 'Save & Continue'}
        </Button>
      </div>
    </form>
  )
}
