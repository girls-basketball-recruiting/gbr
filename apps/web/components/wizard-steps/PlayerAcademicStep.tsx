'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel, FieldDescription, FieldError } from '@workspace/ui/components/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Card } from '@workspace/ui/components/card'
import { AREAS_OF_STUDY } from '@/lib/zod/AreasOfStudy'
import { X } from 'lucide-react'

interface PlayerAcademicStepProps {
  onNext: (data: any) => Promise<void>
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
  error: string | null
}

export function PlayerAcademicStep({ onNext, onBack, error }: PlayerAcademicStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    unweightedGpa: '',
    weightedGpa: '',
    potentialAreasOfStudy: [] as string[],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAreaToggle = (value: string) => {
    setFormData((prev) => {
      const current = prev.potentialAreasOfStudy
      const isSelected = current.includes(value)

      if (isSelected) {
        // Remove if already selected
        return {
          ...prev,
          potentialAreasOfStudy: current.filter((area) => area !== value),
        }
      } else {
        // Add if not at max (3)
        if (current.length < 3) {
          return {
            ...prev,
            potentialAreasOfStudy: [...current, value],
          }
        }
        return prev
      }
    })
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
            Academic Information
          </h2>
          <p className='text-slate-600 dark:text-slate-400'>
            Share your academic achievements and interests
          </p>
        </div>

        {error && <FieldError>{error}</FieldError>}

        <div className='grid grid-cols-2 gap-4'>
          <Field className='gap-1'>
            <FieldLabel htmlFor='unweightedGpa'>Unweighted GPA</FieldLabel>
            <Input
              id='unweightedGpa'
              name='unweightedGpa'
              type='number'
              step='0.01'
              min='0'
              max='4.0'
              value={formData.unweightedGpa}
              onChange={handleChange}
              placeholder='0.00 - 4.00'
            />
          </Field>
          <Field className='gap-1'>
            <FieldLabel htmlFor='weightedGpa'>Weighted GPA</FieldLabel>
            <Input
              id='weightedGpa'
              name='weightedGpa'
              type='number'
              step='0.01'
              min='0'
              max='5.0'
              value={formData.weightedGpa}
              onChange={handleChange}
              placeholder='0.00 - 5.00'
            />
          </Field>
        </div>

        <Field className='gap-1'>
          <FieldLabel>Potential Areas of Study</FieldLabel>
          <FieldDescription>Select up to 3 areas that interest you</FieldDescription>
          <div className='space-y-2 mt-2'>
            {AREAS_OF_STUDY.map((area) => {
              const isSelected = formData.potentialAreasOfStudy.includes(area.value)
              const isMaxSelected = formData.potentialAreasOfStudy.length >= 3

              return (
                <button
                  key={area.value}
                  type='button'
                  onClick={() => handleAreaToggle(area.value)}
                  disabled={!isSelected && isMaxSelected}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 text-blue-900 dark:text-blue-100'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-blue-400 dark:hover:border-blue-500'
                  } ${!isSelected && isMaxSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>{area.label}</span>
                    {isSelected && (
                      <X className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
          <div className='text-sm text-slate-600 dark:text-slate-400 mt-2'>
            {formData.potentialAreasOfStudy.length} of 3 selected
          </div>
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
