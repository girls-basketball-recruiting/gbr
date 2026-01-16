'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { AlertCircle, Plus, Trash2 } from 'lucide-react'
import { Controller, useFieldArray } from 'react-hook-form'
import { AAU_CIRCUITS } from '@/lib/zod/AauCircuits'
import { getPositionOptions } from '@/lib/zod/Positions'
import { PlayerAthleticProfileSchema } from '@/lib/zod/PlayerSteps'
import { useSchemaForm } from '@/hooks/useSchemaForm'
import { FormTextField } from '@/components/form/FormTextField'
import { FormSelectField } from '@/components/form/FormSelectField'
import { FormFieldWrapper } from '@/components/form/FormFieldWrapper'
import { HeightSelect } from '@/components/HeightSelect'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { Field, FieldLabel, FieldDescription } from '@workspace/ui/components/field'
import type { Player } from '@/payload-types'
import { H2, H3, P, Small } from '../ui/typography'

interface PlayerAthleticProfileStepProps {
  onSave: (data: any) => Promise<void>
  error: string | null
  isLastStep: boolean
  profile?: Partial<Player> | null
}

export function PlayerAthleticProfileStep({ onSave, error, isLastStep, profile }: PlayerAthleticProfileStepProps) {
  // Handle video URLs separately (they're stored as array of objects in DB)
  const existingVideoUrls = profile?.highlightVideoUrls && Array.isArray(profile.highlightVideoUrls)
    ? profile.highlightVideoUrls.map((v: any) => typeof v === 'string' ? v : v.url)
    : []

  const [videoUrls, setVideoUrls] = useState<string[]>(
    existingVideoUrls.length > 0 ? existingVideoUrls : []
  )

  // Handle awards - extract from profile
  const existingAwards = profile?.awards && Array.isArray(profile.awards)
    ? profile.awards.map((a: any) => ({
        title: a.title || '',
        year: a.year || '',
        description: a.description || '',
      }))
    : []

  const form = useSchemaForm({
    defaultValues: {
      primaryPosition: profile?.primaryPosition || '',
      secondaryPosition: profile?.secondaryPosition || '',
      heightInInches: profile?.heightInInches || 0,
      aauProgramName: profile?.aauProgramName || '',
      aauTeamName: profile?.aauTeamName || '',
      aauCircuit: profile?.aauCircuit || '',
      aauCoach: profile?.aauCoach || '',
      ppg: profile?.ppg?.toString() || '',
      rpg: profile?.rpg?.toString() || '',
      apg: profile?.apg?.toString() || '',
      bio: profile?.bio || '',
      ncaaId: profile?.ncaaId || '',
      awards: existingAwards,
    },
    schema: PlayerAthleticProfileSchema,
    // Only use FormData in edit mode - onboarding mode needs JSON
    ...(profile ? { fileFields: {} } : {}),
    onSubmit: async (data) => {
      // Filter out empty video URLs and convert to objects for DB
      const filteredUrls = videoUrls
        .filter((url) => url.trim() !== '')
        .map((url) => ({ url }))

      // Filter out completely empty awards before saving
      const filteredAwards = (data as any).awards?.filter(
        (award: any) => award.title?.trim() || award.year?.trim() || award.description?.trim()
      ) || []

      // data is FormData in edit mode, plain object in onboarding mode
      if (data instanceof FormData) {
        data.append('highlightVideoUrls', JSON.stringify(filteredUrls))
        data.append('awards', JSON.stringify(filteredAwards))
        await onSave(data)
      } else {
        await onSave({
          ...(data as any),
          highlightVideoUrls: filteredUrls,
          awards: filteredAwards,
        })
      }
    },
  })

  // Use react-hook-form's useFieldArray for awards management
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'awards',
  })

  const handleVideoUrlChange = (index: number, value: string) => {
    setVideoUrls((prev) => {
      const newUrls = [...prev]
      newUrls[index] = value
      return newUrls
    })
  }

  const addVideoUrl = () => {
    setVideoUrls((prev) => [...prev, ''])
  }

  const removeVideoUrl = (index: number) => {
    setVideoUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const isLoading = form.isSubmitting

  return (
    <form onSubmit={form.handleSubmit} className='space-y-6'>
      <div>
        <H2>
          Athletic Profile
        </H2>
        <P>
          Share your team information, achievements, and performance highlights
        </P>
      </div>

      {(error || form.error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || form.error}</AlertDescription>
        </Alert>
      )}

      {/* Position & Physical Section */}
      <div className='space-y-5'>
        <H3>Position & Physical</H3>

        <div className='grid grid-cols-2 gap-5'>
          <FormSelectField
            control={form.control}
            name='primaryPosition'
            label='Primary Position'
            required
            placeholder='Select position'
            options={getPositionOptions()}
          />

          <FormSelectField
            control={form.control}
            name='secondaryPosition'
            label='Secondary Position'
            placeholder='Select position (optional)'
            options={getPositionOptions()}
          />
        </div>

        <div className='grid grid-cols-2 gap-5'>
          <Controller
            control={form.control}
            name='heightInInches'
            render={({ field, fieldState }) => (
              <FormFieldWrapper
                label='Height'
                required
                error={fieldState.error?.message}
              >
                <HeightSelect
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </FormFieldWrapper>
            )}
          />
          <div />
        </div>
      </div>

      {/* AAU Section */}
      <div className='space-y-5 pt-6 border-t'>
        <H3>
          AAU & Team Information
        </H3>

        <div className='grid grid-cols-2 gap-5'>
          <FormTextField
            control={form.control}
            name='aauProgramName'
            label='AAU Program'
            placeholder='Enter AAU program name'
          />

          <FormSelectField
            control={form.control}
            name='aauCircuit'
            label='AAU Circuit'
            placeholder='Select circuit'
            options={AAU_CIRCUITS.map((circuit) => ({
              value: circuit.value,
              label: circuit.label,
            }))}
          />

          <FormTextField
            control={form.control}
            name='aauTeamName'
            label='AAU Team'
            placeholder='Enter AAU team name'
          />

          <FormTextField
            control={form.control}
            name='aauCoach'
            label='AAU Coach'
            placeholder='Enter AAU coach name'
          />
        </div>
      </div>

      {/* Bio & Achievements Section */}
      <div className='space-y-5 pt-6 border-t'>
        <H3>
          Bio & Achievements
        </H3>

        <Controller
          control={form.control}
          name='bio'
          render={({ field, fieldState }) => (
            <Field className='gap-1'>
              <FieldLabel htmlFor='bio'>Player Bio</FieldLabel>
              <Textarea
                id='bio'
                {...field}
                placeholder='Share your story and what drives you on and off the court'
                rows={6}
              />
              <FieldDescription>
                Tell coaches about your journey, goals, and what makes you unique
              </FieldDescription>
              {fieldState.error && <AlertDescription className="text-red-600">{fieldState.error.message}</AlertDescription>}
            </Field>
          )}
        />

        <Field className='gap-1'>
          <FieldLabel>Awards & Achievements</FieldLabel>
          <FieldDescription>
            Add your athletic awards, honors, all-star selections, championships
          </FieldDescription>
          {fields.length > 0 && (
            <div className='space-y-5 mt-2'>
              {fields.map((field, index) => (
                <div key={field.id} className='border rounded-lg p-4 space-y-3'>
                  <div className='flex items-center justify-between mb-2'>
                    <Small>Award #{index + 1}</Small>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      onClick={() => remove(index)}
                      className='shrink-0'
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>

                  <div className='grid grid-cols-2 gap-5'>
                    <Controller
                      control={form.control}
                      name={`awards.${index}.title`}
                      render={({ field: inputField, fieldState }) => (
                        <div className='flex-col flex-1'>
                          <FieldLabel htmlFor={`award-title-${index}`}>
                            Title
                          </FieldLabel>
                          <Input
                            {...inputField}
                            id={`award-title-${index}`}
                            type='text'
                            placeholder='Enter award title'
                            className={fieldState.error ? 'border-red-500' : ''}
                          />
                          {fieldState.error && (
                            <p className='text-sm text-red-600 mt-1'>{fieldState.error.message}</p>
                          )}
                        </div>
                      )}
                    />

                    <Controller
                      control={form.control}
                      name={`awards.${index}.year`}
                      render={({ field: inputField, fieldState }) => (
                        <div className='flex-col flex-1'>
                          <FieldLabel htmlFor={`award-year-${index}`}>
                            Year
                          </FieldLabel>
                          <Input
                            {...inputField}
                            id={`award-year-${index}`}
                            type='text'
                            placeholder='Enter year'
                            className={fieldState.error ? 'border-red-500' : ''}
                          />
                          {fieldState.error && (
                            <p className='text-sm text-red-600 mt-1'>{fieldState.error.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div className='col-span-2'>
                    <Controller
                      control={form.control}
                      name={`awards.${index}.description`}
                      render={({ field: inputField }) => (
                        <>
                          <FieldLabel htmlFor={`award-description-${index}`}>
                            Description
                          </FieldLabel>
                          <Textarea
                            {...inputField}
                            id={`award-description-${index}`}
                            placeholder='Enter description (optional)'
                            rows={2}
                          />
                        </>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {fields.length < 10 && (
            <Button
              type='button'
              variant='outline'
              onClick={() => append({ title: '', year: '', description: '' })}
              className='mt-3 w-full'
            >
              <Plus className='w-4 h-4 mr-2' />
              {fields.length === 0 ? 'Add an Award' : 'Add Another Award'}
            </Button>
          )}
        </Field>

        <Field className='gap-1'>
          <FieldLabel>Highlight Video URLs</FieldLabel>
          <FieldDescription>
            Add links to your highlight videos (YouTube, Hudl, etc.)
          </FieldDescription>
          {videoUrls.length > 0 && (
            <div className='space-y-3 mt-2'>
              {videoUrls.map((url, index) => (
                <div key={index} className='flex gap-2'>
                  <Input
                    type='url'
                    value={url}
                    onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                    placeholder='https://youtube.com/watch?v=...'
                    className='flex-1'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    onClick={() => removeVideoUrl(index)}
                    className='shrink-0'
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Button
            type='button'
            variant='outline'
            onClick={addVideoUrl}
            className='mt-3 w-full'
          >
            <Plus className='w-4 h-4 mr-2' />
            {videoUrls.length === 0 ? 'Add a Video' : 'Add Another Video'}
          </Button>
        </Field>
      </div>

      {/* Stats Section */}
      <div className='space-y-5 pt-6 border-t'>
        <H3>Statistics & Performance</H3>

        <div className='grid grid-cols-3 gap-5'>
          <Controller
            control={form.control}
            name='ppg'
            render={({ field, fieldState }) => (
              <FormFieldWrapper
                label='PPG'
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  type='text'
                  inputMode='decimal'
                  pattern='[0-9]*\.?[0-9]*'
                  placeholder='Points'
                  onKeyDown={(e) => {
                    if (!/[0-9.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                      e.preventDefault()
                    }
                  }}
                />
              </FormFieldWrapper>
            )}
          />
          <Controller
            control={form.control}
            name='rpg'
            render={({ field, fieldState }) => (
              <FormFieldWrapper
                label='RPG'
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  type='text'
                  inputMode='decimal'
                  pattern='[0-9]*\.?[0-9]*'
                  placeholder='Rebounds'
                  onKeyDown={(e) => {
                    if (!/[0-9.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                      e.preventDefault()
                    }
                  }}
                />
              </FormFieldWrapper>
            )}
          />
          <Controller
            control={form.control}
            name='apg'
            render={({ field, fieldState }) => (
              <FormFieldWrapper
                label='APG'
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  type='text'
                  inputMode='decimal'
                  pattern='[0-9]*\.?[0-9]*'
                  placeholder='Assists'
                  onKeyDown={(e) => {
                    if (!/[0-9.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                      e.preventDefault()
                    }
                  }}
                />
              </FormFieldWrapper>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name='ncaaId'
          render={({ field, fieldState }) => (
            <Field className='gap-1'>
              <FieldLabel htmlFor='ncaaId'>NCAA Eligibility Center ID</FieldLabel>
              <Input
                id='ncaaId'
                {...field}
                placeholder='XXXXXXXXXX (10 digits)'
              />
              <FieldDescription>
                If you&apos;ve registered with the NCAA Eligibility Center
              </FieldDescription>
              {fieldState.error && <AlertDescription className="text-red-600">{fieldState.error.message}</AlertDescription>}
            </Field>
          )}
        />
      </div>

      {/* Navigation */}
      <div className='flex justify-end gap-3 pt-6 border-t'>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Saving...' : isLastStep ? 'Complete Profile' : 'Save & Continue'}
        </Button>
      </div>
    </form>
  )
}
