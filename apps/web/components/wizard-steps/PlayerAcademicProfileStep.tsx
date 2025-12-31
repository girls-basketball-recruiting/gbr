'use client'

import { Button } from '@workspace/ui/components/button'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { AlertCircle, X } from 'lucide-react'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel, FieldDescription } from '@workspace/ui/components/field'
import { Checkbox } from '@/components/ui/checkbox'
import { AREAS_OF_STUDY } from '@/lib/zod/AreasOfStudy'
import { LEVELS_OF_PLAY } from '@/lib/zod/LevelsOfPlay'
import { GEOGRAPHIC_AREAS } from '@/lib/zod/GeographicAreas'
import { DISTANCE_FROM_HOME_OPTIONS } from '@/lib/zod/DistanceFromHome'
import { PlayerAcademicProfileSchema } from '@/lib/zod/PlayerSteps'
import { useSchemaForm } from '@/hooks/useSchemaForm'
import { FormTextField } from '@/components/form/FormTextField'
import { FormSelectField } from '@/components/form/FormSelectField'
import type { Player } from '@/payload-types'

interface PlayerAcademicProfileStepProps {
  onSave: (data: any) => Promise<void>
  error: string | null
  isLastStep: boolean
  profile?: Partial<Player> | null
}

export function PlayerAcademicProfileStep({ onSave, error, isLastStep, profile }: PlayerAcademicProfileStepProps) {
  const form = useSchemaForm({
    defaultValues: {
      unweightedGpa: profile?.unweightedGpa?.toString() || '',
      weightedGpa: profile?.weightedGpa?.toString() || '',
      potentialAreasOfStudy: profile?.potentialAreasOfStudy || [],
      desiredLevelsOfPlay: profile?.desiredLevelsOfPlay || [],
      desiredGeographicAreas: profile?.desiredGeographicAreas || [],
      desiredDistanceFromHome: profile?.desiredDistanceFromHome || '',
      interestedInMilitaryAcademies: profile?.interestedInMilitaryAcademies || false,
      interestedInUltraHighAcademics: profile?.interestedInUltraHighAcademics || false,
      interestedInFaithBased: profile?.interestedInFaithBased || false,
      interestedInAllGirls: profile?.interestedInAllGirls || false,
      interestedInHBCU: profile?.interestedInHBCU || false,
    },
    schema: PlayerAcademicProfileSchema,
    fileFields: {}, // Force FormData creation for edit mode
    onSubmit: async (data) => {
      await onSave(data)
    },
  })

  // Watch array fields for toggle buttons
  const potentialAreasOfStudy = form.watch('potentialAreasOfStudy') || []
  const desiredLevelsOfPlay = form.watch('desiredLevelsOfPlay') || []
  const desiredGeographicAreas = form.watch('desiredGeographicAreas') || []

  const handleAreaToggle = (value: string) => {
    const current = potentialAreasOfStudy
    const isSelected = (current as string[]).includes(value)

    if (isSelected) {
      form.setValue('potentialAreasOfStudy', (current as string[]).filter((area) => area !== value) as any)
    } else if (current.length < 3) {
      form.setValue('potentialAreasOfStudy', [...current, value] as any)
    }
  }

  const handleLevelToggle = (value: string) => {
    const current = desiredLevelsOfPlay
    const isSelected = (current as string[]).includes(value)

    if (isSelected) {
      form.setValue('desiredLevelsOfPlay', (current as string[]).filter((level) => level !== value) as any)
    } else if (current.length < 4) {
      form.setValue('desiredLevelsOfPlay', [...current, value] as any)
    }
  }

  const handleGeographicToggle = (value: string) => {
    const current = desiredGeographicAreas
    const isSelected = (current as string[]).includes(value)

    if (isSelected) {
      form.setValue('desiredGeographicAreas', (current as string[]).filter((area) => area !== value) as any)
    } else if (current.length < 3) {
      form.setValue('desiredGeographicAreas', [...current, value] as any)
    }
  }

  const isLoading = form.isSubmitting

  return (
    <form onSubmit={form.handleSubmit} className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
          Academic Profile
        </h2>
        <p className='text-slate-600 dark:text-slate-400'>
          Share your academic achievements and college preferences
        </p>
      </div>

      {(error || form.error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || form.error}</AlertDescription>
        </Alert>
      )}

      {/* Academic Section */}
      <div className='space-y-5'>
        <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>
          Academic Information
        </h3>

        <div className='grid grid-cols-2 md:grid-cols-3 gap-5'>
          <FormTextField
            control={form.control}
            name='unweightedGpa'
            label='Unweighted GPA'
            placeholder='0.00 - 4.00'
          />
          <FormTextField
            control={form.control}
            name='weightedGpa'
            label='Weighted GPA'
            placeholder='0.00 - 5.00'
          />
        </div>

        <Field className='gap-1'>
          <FieldLabel>Potential Areas of Study</FieldLabel>
          <FieldDescription>Select up to 3 areas that interest you</FieldDescription>
          <div className='grid md:grid-cols-2 gap-3 mt-2'>
            {AREAS_OF_STUDY.map((area) => {
              const isSelected = (potentialAreasOfStudy as string[]).includes(area.value)
              const isMaxSelected = potentialAreasOfStudy.length >= 3

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
            {potentialAreasOfStudy.length} of 3 selected
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
          <FieldDescription>Select up to 4 levels you&apos;re interested in</FieldDescription>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mt-2'>
            {LEVELS_OF_PLAY.map((level) => {
              const isSelected = (desiredLevelsOfPlay as string[]).includes(level.value)
              const isMaxSelected = desiredLevelsOfPlay.length >= 4

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
            {desiredLevelsOfPlay.length} of 4 selected
          </div>
        </Field>

        <Field className='gap-1'>
          <FieldLabel>Desired Geographic Areas</FieldLabel>
          <FieldDescription>Select up to 3 regions you&apos;d like to play in</FieldDescription>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-3 mt-2'>
            {GEOGRAPHIC_AREAS.map((area) => {
              const isSelected = (desiredGeographicAreas as string[]).includes(area.value)
              const isMaxSelected = desiredGeographicAreas.length >= 3

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
            {desiredGeographicAreas.length} of 3 selected
          </div>
        </Field>

        <FormSelectField
          control={form.control}
          name='desiredDistanceFromHome'
          label='Distance from Home'
          placeholder='Select distance preference'
          options={DISTANCE_FROM_HOME_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />

        <Field className='gap-1'>
          <FieldLabel>Special Interests</FieldLabel>
          <FieldDescription>Select any that apply to you</FieldDescription>
          <div className='space-y-3 mt-2'>
            <div className='flex items-center gap-3'>
              <Checkbox
                id='interestedInMilitaryAcademies'
                checked={form.watch('interestedInMilitaryAcademies')}
                onCheckedChange={(checked) =>
                  form.setValue('interestedInMilitaryAcademies', checked as boolean)
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
                checked={form.watch('interestedInUltraHighAcademics')}
                onCheckedChange={(checked) =>
                  form.setValue('interestedInUltraHighAcademics', checked as boolean)
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
                checked={form.watch('interestedInFaithBased')}
                onCheckedChange={(checked) =>
                  form.setValue('interestedInFaithBased', checked as boolean)
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
                checked={form.watch('interestedInAllGirls')}
                onCheckedChange={(checked) =>
                  form.setValue('interestedInAllGirls', checked as boolean)
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
                checked={form.watch('interestedInHBCU')}
                onCheckedChange={(checked) =>
                  form.setValue('interestedInHBCU', checked as boolean)
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
        <Button type='submit' disabled={isLoading} className='bg-blue-600 hover:bg-blue-700'>
          {isLoading ? 'Saving...' : isLastStep ? 'Complete Profile' : 'Save & Continue'}
        </Button>
      </div>
    </form>
  )
}
