'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Field, FieldLabel, FieldDescription, FieldError } from '@workspace/ui/components/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Card } from '@workspace/ui/components/card'
import { Checkbox } from '@/components/ui/checkbox'
import { LEVELS_OF_PLAY } from '@/lib/zod/LevelsOfPlay'
import { GEOGRAPHIC_AREAS } from '@/lib/zod/GeographicAreas'
import { DISTANCE_FROM_HOME_OPTIONS } from '@/lib/zod/DistanceFromHome'
import { X } from 'lucide-react'

interface PlayerPreferencesStepProps {
  onNext: (data: any) => Promise<void>
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
  error: string | null
}

export function PlayerPreferencesStep({ onNext, onBack, error }: PlayerPreferencesStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    desiredLevelsOfPlay: [] as string[],
    desiredGeographicAreas: [] as string[],
    desiredDistanceFromHome: '',
    interestedInMilitaryAcademies: false,
    interestedInUltraHighAcademics: false,
    interestedInFaithBased: false,
    interestedInAllGirls: false,
    interestedInHBCU: false,
  })

  const handleLevelToggle = (value: string) => {
    setFormData((prev) => {
      const current = prev.desiredLevelsOfPlay
      const isSelected = current.includes(value)

      if (isSelected) {
        return {
          ...prev,
          desiredLevelsOfPlay: current.filter((level) => level !== value),
        }
      } else {
        if (current.length < 4) {
          return {
            ...prev,
            desiredLevelsOfPlay: [...current, value],
          }
        }
        return prev
      }
    })
  }

  const handleGeographicToggle = (value: string) => {
    setFormData((prev) => {
      const current = prev.desiredGeographicAreas
      const isSelected = current.includes(value)

      if (isSelected) {
        return {
          ...prev,
          desiredGeographicAreas: current.filter((area) => area !== value),
        }
      } else {
        if (current.length < 3) {
          return {
            ...prev,
            desiredGeographicAreas: [...current, value],
          }
        }
        return prev
      }
    })
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
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
            College Preferences
          </h2>
          <p className='text-slate-600 dark:text-slate-400'>
            Help coaches understand what you're looking for
          </p>
        </div>

        {error && <FieldError>{error}</FieldError>}

        {/* Desired Levels of Play */}
        <Field className='gap-1'>
          <FieldLabel>Desired Levels of Play</FieldLabel>
          <FieldDescription>Select up to 4 levels you're interested in</FieldDescription>
          <div className='grid grid-cols-2 gap-2 mt-2'>
            {LEVELS_OF_PLAY.map((level) => {
              const isSelected = formData.desiredLevelsOfPlay.includes(level.value)
              const isMaxSelected = formData.desiredLevelsOfPlay.length >= 4

              return (
                <button
                  key={level.value}
                  type='button'
                  onClick={() => handleLevelToggle(level.value)}
                  disabled={!isSelected && isMaxSelected}
                  className={`text-left px-4 py-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 text-blue-900 dark:text-blue-100'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-blue-400 dark:hover:border-blue-500'
                  } ${!isSelected && isMaxSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-sm'>{level.label}</span>
                    {isSelected && (
                      <X className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
          <div className='text-sm text-slate-600 dark:text-slate-400 mt-2'>
            {formData.desiredLevelsOfPlay.length} of 4 selected
          </div>
        </Field>

        {/* Desired Geographic Areas */}
        <Field className='gap-1'>
          <FieldLabel>Desired Geographic Areas</FieldLabel>
          <FieldDescription>Select up to 3 regions you'd like to play in</FieldDescription>
          <div className='grid grid-cols-2 gap-2 mt-2'>
            {GEOGRAPHIC_AREAS.map((area) => {
              const isSelected = formData.desiredGeographicAreas.includes(area.value)
              const isMaxSelected = formData.desiredGeographicAreas.length >= 3

              return (
                <button
                  key={area.value}
                  type='button'
                  onClick={() => handleGeographicToggle(area.value)}
                  disabled={!isSelected && isMaxSelected}
                  className={`text-left px-4 py-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 text-blue-900 dark:text-blue-100'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-blue-400 dark:hover:border-blue-500'
                  } ${!isSelected && isMaxSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-sm'>{area.label}</span>
                    {isSelected && (
                      <X className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
          <div className='text-sm text-slate-600 dark:text-slate-400 mt-2'>
            {formData.desiredGeographicAreas.length} of 3 selected
          </div>
        </Field>

        {/* Distance from Home */}
        <Field className='gap-1'>
          <FieldLabel htmlFor='desiredDistanceFromHome'>Distance from Home</FieldLabel>
          <Select
            value={formData.desiredDistanceFromHome}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, desiredDistanceFromHome: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select distance preference' />
            </SelectTrigger>
            <SelectContent>
              {DISTANCE_FROM_HOME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Special Interests */}
        <Field className='gap-1'>
          <FieldLabel>Special Interests</FieldLabel>
          <FieldDescription>Select any that apply to you</FieldDescription>
          <div className='space-y-3 mt-2'>
            <div className='flex items-center gap-3'>
              <Checkbox
                id='interestedInMilitaryAcademies'
                checked={formData.interestedInMilitaryAcademies}
                onCheckedChange={(checked) =>
                  handleCheckboxChange('interestedInMilitaryAcademies', checked as boolean)
                }
              />
              <label
                htmlFor='interestedInMilitaryAcademies'
                className='text-sm font-medium text-slate-900 dark:text-white cursor-pointer'
              >
                Interested in Military Academies
              </label>
            </div>
            <div className='flex items-center gap-3'>
              <Checkbox
                id='interestedInUltraHighAcademics'
                checked={formData.interestedInUltraHighAcademics}
                onCheckedChange={(checked) =>
                  handleCheckboxChange('interestedInUltraHighAcademics', checked as boolean)
                }
              />
              <label
                htmlFor='interestedInUltraHighAcademics'
                className='text-sm font-medium text-slate-900 dark:text-white cursor-pointer'
              >
                Interested in Ultra High Academics (Ivy League, etc.)
              </label>
            </div>
            <div className='flex items-center gap-3'>
              <Checkbox
                id='interestedInFaithBased'
                checked={formData.interestedInFaithBased}
                onCheckedChange={(checked) =>
                  handleCheckboxChange('interestedInFaithBased', checked as boolean)
                }
              />
              <label
                htmlFor='interestedInFaithBased'
                className='text-sm font-medium text-slate-900 dark:text-white cursor-pointer'
              >
                Interested in Faith-Based Schools
              </label>
            </div>
            <div className='flex items-center gap-3'>
              <Checkbox
                id='interestedInAllGirls'
                checked={formData.interestedInAllGirls}
                onCheckedChange={(checked) =>
                  handleCheckboxChange('interestedInAllGirls', checked as boolean)
                }
              />
              <label
                htmlFor='interestedInAllGirls'
                className='text-sm font-medium text-slate-900 dark:text-white cursor-pointer'
              >
                Interested in All-Girls Schools
              </label>
            </div>
            <div className='flex items-center gap-3'>
              <Checkbox
                id='interestedInHBCU'
                checked={formData.interestedInHBCU}
                onCheckedChange={(checked) =>
                  handleCheckboxChange('interestedInHBCU', checked as boolean)
                }
              />
              <label
                htmlFor='interestedInHBCU'
                className='text-sm font-medium text-slate-900 dark:text-white cursor-pointer'
              >
                Interested in HBCUs
              </label>
            </div>
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
