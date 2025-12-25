'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { Field, FieldLabel, FieldDescription, FieldError } from '@workspace/ui/components/field'
import { Card } from '@workspace/ui/components/card'
import { Plus, Trash2 } from 'lucide-react'

interface PlayerStatsStepProps {
  onNext: (data: any) => Promise<void>
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
  error: string | null
}

export function PlayerStatsStep({ onNext, onBack, isLastStep, error }: PlayerStatsStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    ppg: '',
    rpg: '',
    apg: '',
    bio: '',
    highlightVideoUrls: [''],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleVideoUrlChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newUrls = [...prev.highlightVideoUrls]
      newUrls[index] = value
      return { ...prev, highlightVideoUrls: newUrls }
    })
  }

  const addVideoUrl = () => {
    setFormData((prev) => ({
      ...prev,
      highlightVideoUrls: [...prev.highlightVideoUrls, ''],
    }))
  }

  const removeVideoUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlightVideoUrls: prev.highlightVideoUrls.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Filter out empty video URLs before submitting
      const dataToSubmit = {
        ...formData,
        highlightVideoUrls: formData.highlightVideoUrls.filter((url) => url.trim() !== ''),
      }
      await onNext(dataToSubmit)
    } catch (err) {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-8'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
            Stats & Media
          </h2>
          <p className='text-slate-600 dark:text-slate-400'>
            Showcase your performance and share your highlight videos
          </p>
        </div>

        {error && <FieldError>{error}</FieldError>}

        {/* Stats */}
        <div className='grid grid-cols-3 gap-4'>
          <Field className='gap-1'>
            <FieldLabel htmlFor='ppg'>PPG</FieldLabel>
            <Input
              id='ppg'
              name='ppg'
              type='number'
              step='0.1'
              min='0'
              value={formData.ppg}
              onChange={handleChange}
              placeholder='Points per game'
            />
          </Field>
          <Field className='gap-1'>
            <FieldLabel htmlFor='rpg'>RPG</FieldLabel>
            <Input
              id='rpg'
              name='rpg'
              type='number'
              step='0.1'
              min='0'
              value={formData.rpg}
              onChange={handleChange}
              placeholder='Rebounds per game'
            />
          </Field>
          <Field className='gap-1'>
            <FieldLabel htmlFor='apg'>APG</FieldLabel>
            <Input
              id='apg'
              name='apg'
              type='number'
              step='0.1'
              min='0'
              value={formData.apg}
              onChange={handleChange}
              placeholder='Assists per game'
            />
          </Field>
        </div>

        {/* Bio */}
        <Field className='gap-1'>
          <FieldLabel htmlFor='bio'>Player Bio</FieldLabel>
          <Textarea
            id='bio'
            name='bio'
            value={formData.bio}
            onChange={handleChange}
            placeholder='Tell coaches about yourself, your playing style, and what makes you unique...'
            rows={6}
          />
          <FieldDescription>
            This is your chance to stand out - share your story and what drives you on and off the
            court
          </FieldDescription>
        </Field>

        {/* Highlight Videos */}
        <Field className='gap-1'>
          <FieldLabel>Highlight Video URLs</FieldLabel>
          <FieldDescription>
            Add links to your highlight videos (YouTube, Hudl, etc.)
          </FieldDescription>
          <div className='space-y-3 mt-2'>
            {formData.highlightVideoUrls.map((url, index) => (
              <div key={index} className='flex gap-2'>
                <Input
                  type='url'
                  value={url}
                  onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                  placeholder='https://youtube.com/watch?v=...'
                  className='flex-1'
                />
                {formData.highlightVideoUrls.length > 1 && (
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    onClick={() => removeVideoUrl(index)}
                    className='shrink-0'
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type='button'
            variant='outline'
            onClick={addVideoUrl}
            className='mt-3 w-full'
          >
            <Plus className='w-4 h-4 mr-2' />
            Add Another Video
          </Button>
        </Field>

        <div className='flex justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-700'>
          <Button type='button' variant='outline' onClick={onBack}>
            Back
          </Button>
          <Button type='submit' disabled={isSubmitting} className='bg-blue-600 hover:bg-blue-700'>
            {isSubmitting ? 'Saving...' : isLastStep ? 'Complete Profile' : 'Continue'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
