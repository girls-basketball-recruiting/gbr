'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { Field, FieldLabel, FieldDescription, FieldError } from '@workspace/ui/components/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Card } from '@workspace/ui/components/card'
import { AAU_CIRCUITS } from '@/lib/zod/AauCircuits'

interface PlayerAAUStepProps {
  onNext: (data: any) => Promise<void>
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
  error: string | null
}

export function PlayerAAUStep({ onNext, onBack, error }: PlayerAAUStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    aauProgram: '',
    aauTeam: '',
    aauCircuit: '',
    aauCoach: '',
    awards: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            AAU & Awards
          </h2>
          <p className='text-slate-600 dark:text-slate-400'>
            Share your team information and achievements
          </p>
        </div>

        {error && <FieldError>{error}</FieldError>}

        <Field className='gap-1'>
          <FieldLabel htmlFor='aauProgram'>AAU Program</FieldLabel>
          <Input
            id='aauProgram'
            name='aauProgram'
            value={formData.aauProgram}
            onChange={handleChange}
            placeholder='e.g., Nike Team Florida'
          />
          <FieldDescription>Your AAU program name</FieldDescription>
        </Field>

        <Field className='gap-1'>
          <FieldLabel htmlFor='aauTeam'>AAU Team</FieldLabel>
          <Input
            id='aauTeam'
            name='aauTeam'
            value={formData.aauTeam}
            onChange={handleChange}
            placeholder='Team name'
          />
        </Field>

        <Field className='gap-1'>
          <FieldLabel htmlFor='aauCircuit'>AAU Circuit</FieldLabel>
          <Select
            value={formData.aauCircuit}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, aauCircuit: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select circuit' />
            </SelectTrigger>
            <SelectContent>
              {AAU_CIRCUITS.map((circuit) => (
                <SelectItem key={circuit.value} value={circuit.value}>
                  {circuit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field className='gap-1'>
          <FieldLabel htmlFor='aauCoach'>AAU Coach</FieldLabel>
          <Input
            id='aauCoach'
            name='aauCoach'
            value={formData.aauCoach}
            onChange={handleChange}
            placeholder='Coach name'
          />
        </Field>

        <Field className='gap-1'>
          <FieldLabel htmlFor='awards'>Awards & Achievements</FieldLabel>
          <Textarea
            id='awards'
            name='awards'
            value={formData.awards}
            onChange={handleChange}
            placeholder='List your athletic awards, honors, all-star selections, championships, etc.'
            rows={4}
          />
          <FieldDescription>Highlight your accomplishments on the court</FieldDescription>
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
