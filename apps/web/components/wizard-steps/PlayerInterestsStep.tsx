'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel, FieldDescription, FieldError } from '@workspace/ui/components/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Checkbox } from '@/components/ui/checkbox'
import { AREAS_OF_STUDY } from '@/lib/zod/AreasOfStudy'
import { LEVELS_OF_PLAY } from '@/lib/zod/LevelsOfPlay'
import { GEOGRAPHIC_AREAS } from '@/lib/zod/GeographicAreas'
import { DISTANCE_FROM_HOME_OPTIONS } from '@/lib/zod/DistanceFromHome'
import { X } from 'lucide-react'

interface PlayerInterestsStepProps {
  onSave: (data: any) => Promise<void>
  error: string | null
  isLastStep: boolean
}

export function PlayerInterestsStep({ onSave, error, isLastStep }: PlayerInterestsStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Academic fields
    unweightedGpa: '',
    weightedGpa: '',
    potentialAreasOfStudy: [] as string[],
    // Preferences fields
    desiredLevelsOfPlay: [] as string[],
    desiredGeographicAreas: [] as string[],
    desiredDistanceFromHome: '',
    interestedInMilitaryAcademies: false,
    interestedInUltraHighAcademics: false,
    interestedInFaithBased: false,
    interestedInAllGirls: false,
    interestedInHBCU: false,
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
        return {
          ...prev,
          potentialAreasOfStudy: current.filter((area) => area !== value),
        }
      } else {
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
      await onSave(formData)
    } catch (err) {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
          Academic & College Interests
        </h2>
        <p className='text-slate-600 dark:text-slate-400'>
          Share your academic achievements and college preferences
        </p>
      </div>

      {error && <FieldError>{error}</FieldError>}

      {/* Academic Section */}
      <div className='space-y-5'>
        <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>
          Academic Information
        </h3>

        <div className='grid grid-cols-2 md:grid-cols-3 gap-5'>
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
          <div className='grid md:grid-cols-2 gap-3 mt-2'>
            {AREAS_OF_STUDY.map((area) => {
              const isSelected = formData.potentialAreasOfStudy.includes(area.value)
              const isMaxSelected = formData.potentialAreasOfStudy.length >= 3

              return (
                <button
                  key={area.value}
                  type='button'
                  onClick={() => handleAreaToggle(area.value)}
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
            {formData.potentialAreasOfStudy.length} of 3 selected
          </div>
        </Field>
      </div>

      {/* College Preferences Section */}
      <div className='space-y-5 pt-6 border-t border-slate-200 dark:border-slate-700'>
        <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>
          College Preferences
        </h3>

        <Field className='gap-1'>
          <FieldLabel>Desired Levels of Play</FieldLabel>
          <FieldDescription>Select up to 4 levels you're interested in</FieldDescription>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mt-2'>
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

        <Field className='gap-1'>
          <FieldLabel>Desired Geographic Areas</FieldLabel>
          <FieldDescription>Select up to 3 regions you'd like to play in</FieldDescription>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-3 mt-2'>
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
      </div>

      {/* Navigation */}
      <div className='flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700'>
        <Button type='submit' disabled={isSubmitting} className='bg-blue-600 hover:bg-blue-700'>
          {isSubmitting ? 'Saving...' : isLastStep ? 'Complete Profile' : 'Save & Continue'}
        </Button>
      </div>
    </form>
  )
}
