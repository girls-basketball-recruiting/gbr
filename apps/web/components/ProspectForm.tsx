'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { FieldSet, FieldLegend, FieldGroup, Field, FieldLabel, FieldDescription } from '@workspace/ui/components/field'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { ProspectSchema } from '@/lib/zod/Prospects'
import { useSchemaForm } from '@/hooks/useSchemaForm'
import { getGraduationYearOptions } from '@/lib/zod/GraduationYears'
import { FormTextField } from '@/components/form/FormTextField'
import { FormTextareaField } from '@/components/form/FormTextareaField'
import { FormSelectField } from '@/components/form/FormSelectField'
import { HeightInput } from '@/components/specialized/HeightInput'
import { WeightInput } from '@/components/specialized/WeightInput'
import { PhoneInput } from '@/components/specialized/PhoneInput'

interface ProspectFormProps {
  coachId?: string | number
}

export function ProspectForm({ coachId }: ProspectFormProps) {
  const router = useRouter()
  const [tournaments, setTournaments] = useState<any[]>([])
  const [selectedTournaments, setSelectedTournaments] = useState<string[]>([])

  // Fetch tournaments on mount
  useEffect(() => {
    async function fetchTournaments() {
      try {
        const response = await fetch('/api/tournaments')
        if (response.ok) {
          const data = await response.json()
          setTournaments(data.docs || [])
        }
      } catch (error) {
        console.error('Failed to fetch tournaments:', error)
      }
    }
    fetchTournaments()
  }, [])

  const form = useSchemaForm({
    defaultValues: {
      coach: coachId?.toString() || '',
      firstName: '',
      lastName: '',
      uniformNumber: '',
      graduationYear: (new Date().getFullYear() + 1).toString(),
      heightInInches: undefined,
      weight: undefined,
      highSchool: '',
      aauProgram: '',
      twitterHandle: '',
      phoneNumber: '',
      notes: '',
      tournamentSchedule: [],
      linkedPlayer: '',
    },
    schema: ProspectSchema,
    onSubmit: async (data) => {
      const response = await fetch('/api/prospects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          tournamentSchedule: selectedTournaments,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create prospect')
      }

      // Redirect back to dashboard
      router.push('/')
      router.refresh()
    },
  })

  const handleTournamentToggle = (tournamentId: string) => {
    setSelectedTournaments(prev =>
      prev.includes(tournamentId)
        ? prev.filter(id => id !== tournamentId)
        : [...prev, tournamentId]
    )
  }

  return (
    <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-8'>
      <form onSubmit={form.handleSubmit}>
        <FieldSet>
          <FieldLegend className='mb-6'>Prospect Information</FieldLegend>
          <FieldGroup>
            <div className='grid md:grid-cols-2 gap-5'>
              <FormTextField
                control={form.control}
                name='firstName'
                label='First Name'
                required
                placeholder='Required'
              />
              <FormTextField
                control={form.control}
                name='lastName'
                label='Last Name'
                required
                placeholder='Required'
              />
            </div>

            <div className='grid md:grid-cols-2 gap-5'>
              <FormTextField
                control={form.control}
                name='uniformNumber'
                label='Uniform Number'
                placeholder='23'
              />
              <FormSelectField
                control={form.control}
                name='graduationYear'
                label='Graduation Year'
                required
                placeholder='Select year'
                options={getGraduationYearOptions().map(year => ({
                  value: year.value,
                  label: year.label,
                }))}
              />
            </div>

            <div className='grid md:grid-cols-2 gap-5'>
              <HeightInput control={form.control} name='heightInInches' />
              <WeightInput control={form.control} name='weight' />
            </div>

            <div className='grid md:grid-cols-2 gap-5'>
              <FormTextField
                control={form.control}
                name='highSchool'
                label='High School'
                placeholder='High School Name'
              />
              <FormTextField
                control={form.control}
                name='aauProgram'
                label='AAU Program'
                placeholder='AAU Program Name'
              />
            </div>

            <div className='grid md:grid-cols-2 gap-5'>
              <FormTextField
                control={form.control}
                name='twitterHandle'
                label='Twitter/X Handle'
                placeholder='@username'
              />
              <PhoneInput
                control={form.control}
                name='phoneNumber'
                placeholder='(555) 555-5555'
              />
            </div>

            {tournaments.length > 0 && (
              <Field className='gap-1'>
                <FieldLabel>Tournament Schedule</FieldLabel>
                <FieldDescription>
                  Select all tournaments this prospect will attend.
                </FieldDescription>
                <div className='space-y-2 max-h-48 overflow-y-auto rounded-md p-3 border'>
                  {tournaments.map(tournament => (
                    <label
                      key={tournament.id}
                      className='flex items-center space-x-2 cursor-pointer'
                    >
                      <Checkbox
                        checked={selectedTournaments.includes(tournament.id)}
                        onCheckedChange={() =>
                          handleTournamentToggle(tournament.id)
                        }
                        id={`tournament-${tournament.id}`}
                      />
                      <span className='text-sm'>
                        {tournament.name} - {tournament.location}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>
            )}

            <FormTextareaField
              control={form.control}
              name='notes'
              label='Private Notes'
              description='Only visible to you'
              placeholder='Add any private notes about this prospect...'
              rows={4}
            />

            <div className='flex gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                className='flex-1'
                disabled={form.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='flex-1 bg-purple-600 hover:bg-purple-700'
                disabled={form.isSubmitting}
              >
                {form.isSubmitting ? 'Creating...' : 'Create Prospect'}
              </Button>
            </div>
          </FieldGroup>
        </FieldSet>
      </form>
    </Card>
  )
}
