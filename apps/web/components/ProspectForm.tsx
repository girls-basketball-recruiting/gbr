'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@workspace/ui/components/tabs'
import { Field, FieldLabel, FieldDescription } from '@workspace/ui/components/field'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { AlertCircle, Plus, Trash2, X } from 'lucide-react'
import { Controller, useFieldArray } from 'react-hook-form'
import { ProspectSchema } from '@/lib/zod/Prospects'
import { useSchemaForm } from '@/hooks/useSchemaForm'
import { getGraduationYearOptions } from '@/lib/zod/GraduationYears'
import { getPositionOptions } from '@/lib/zod/Positions'
import { AAU_CIRCUITS } from '@/lib/zod/AauCircuits'
import { AAU_AGE_BRACKETS } from '@/lib/zod/AauAgeBrackets'
import { US_STATES_AND_TERRITORIES } from '@/lib/zod/States'
import { AREAS_OF_STUDY } from '@/lib/zod/AreasOfStudy'
import { LEVELS_OF_PLAY } from '@/lib/zod/LevelsOfPlay'
import { GEOGRAPHIC_AREAS } from '@/lib/zod/GeographicAreas'
import { DISTANCE_FROM_HOME_OPTIONS } from '@/lib/zod/DistanceFromHome'
import { FormTextField } from '@/components/form/FormTextField'
import { FormTextareaField } from '@/components/form/FormTextareaField'
import { FormSelectField } from '@/components/form/FormSelectField'
import { FormFieldWrapper } from '@/components/form/FormFieldWrapper'
import { ProfileImageUpload } from '@/components/form/ProfileImageUpload'
import { HeightSelect } from '@/components/HeightSelect'
import type { CoachProspect } from '@/payload-types'
import { H3, Small } from './ui/typography'

const ToggleButton = ({ children, onClick, isMaxSelected, isSelected, isDisabled }: {
  children: React.ReactNode
  onClick: () => void
  isSelected: boolean
  isMaxSelected: boolean
  isDisabled: boolean
}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={isDisabled}
      className={`text-left px-4 py-3 rounded-lg border transition-all ${
        isSelected
          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-600 text-purple-900 dark:text-purple-100'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-purple-400 dark:hover:border-purple-500'
      } ${!isSelected && isMaxSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className='flex items-center justify-between'>
        <span className='font-medium text-sm'>{children}</span>
        {isSelected && (
          <X className='w-4 h-4 text-purple-600 dark:text-purple-400' />
        )}
      </div>
    </button>
  )
}

interface ProspectFormProps {
  coachId?: string | number
  prospect?: CoachProspect | null
  mode?: 'create' | 'edit'
}

export function ProspectForm({ coachId, prospect, mode = 'create' }: ProspectFormProps) {
  const router = useRouter()
  const [tournaments, setTournaments] = useState<any[]>([])
  const [selectedTournaments, setSelectedTournaments] = useState<string[]>(
    prospect?.tournamentSchedule?.map((t: any) => typeof t === 'object' ? t.id?.toString() : t?.toString()) || []
  )
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState('basic')

  // Handle video URLs separately
  const existingVideoUrls = prospect?.highlightVideoUrls && Array.isArray(prospect.highlightVideoUrls)
    ? prospect.highlightVideoUrls.map((v: any) => typeof v === 'string' ? v : v.url)
    : []
  const [videoUrls, setVideoUrls] = useState<string[]>(existingVideoUrls.length > 0 ? existingVideoUrls : [])

  // Fetch tournaments on mount
  useEffect(() => {
    async function fetchTournaments() {
      try {
        const response = await fetch('/api/tournaments/list')
        if (response.ok) {
          const data = await response.json()
          setTournaments(data.tournaments || [])
        }
      } catch (error) {
        console.error('Failed to fetch tournaments:', error)
      }
    }
    fetchTournaments()
  }, [])

  // Handle awards
  const existingAwards = prospect?.awards && Array.isArray(prospect.awards)
    ? prospect.awards.map((a: any) => ({
        title: a.title || '',
        year: a.year || '',
        description: a.description || '',
      }))
    : []

  const form = useSchemaForm({
    defaultValues: {
      coach: coachId?.toString() || '',
      firstName: prospect?.firstName || '',
      lastName: prospect?.lastName || '',
      graduationYear: prospect?.graduationYear?.toString() || null,
      city: prospect?.city || '',
      state: prospect?.state || '',
      highSchool: prospect?.highSchool || '',
      schoolTeamScheduleUrl: prospect?.schoolTeamScheduleUrl || '',
      primaryPosition: prospect?.primaryPosition || '',
      secondaryPosition: prospect?.secondaryPosition || '',
      heightInInches: prospect?.heightInInches || null,
      weight: prospect?.weight || null,
      bio: prospect?.bio || '',
      aauProgramName: prospect?.aauProgramName || '',
      aauTeamName: prospect?.aauTeamName || '',
      aauCircuit: prospect?.aauCircuit || '',
      aauCoach: prospect?.aauCoach || '',
      aauAgeBracket: prospect?.aauAgeBracket || '',
      ppg: prospect?.ppg?.toString() || '',
      rpg: prospect?.rpg?.toString() || '',
      apg: prospect?.apg?.toString() || '',
      unweightedGpa: prospect?.unweightedGpa?.toString() || '',
      weightedGpa: prospect?.weightedGpa?.toString() || '',
      ncaaId: prospect?.ncaaId || '',
      potentialAreasOfStudy: prospect?.potentialAreasOfStudy || [],
      desiredLevelsOfPlay: prospect?.desiredLevelsOfPlay || [],
      desiredGeographicAreas: prospect?.desiredGeographicAreas || [],
      desiredDistanceFromHome: prospect?.desiredDistanceFromHome || '',
      interestedInMilitaryAcademies: prospect?.interestedInMilitaryAcademies || false,
      interestedInUltraHighAcademics: prospect?.interestedInUltraHighAcademics || false,
      interestedInFaithBased: prospect?.interestedInFaithBased || false,
      interestedInAllGirls: prospect?.interestedInAllGirls || false,
      interestedInHBCU: prospect?.interestedInHBCU || false,
      phoneNumber: prospect?.phoneNumber || '',
      xHandle: prospect?.xHandle || '',
      instaHandle: prospect?.instaHandle || '',
      tiktokHandle: prospect?.tiktokHandle || '',
      notes: prospect?.notes || '',
      awards: existingAwards,
    },
    schema: ProspectSchema,
    // Don't use fileFields - we handle FormData building ourselves to include extra fields
    onSubmit: async (data) => {
      // Filter out empty video URLs and convert to objects
      const filteredUrls = videoUrls
        .filter((url) => url.trim() !== '')
        .map((url) => ({ url }))

      // Filter out empty awards
      const filteredAwards = (data as any).awards?.filter(
        (award: any) => award.title?.trim() || award.year?.trim() || award.description?.trim()
      ) || []

      // Build the request FormData
      const formData = new FormData()

      // Add all form fields from the validated data object
      Object.entries(data as any).forEach(([key, value]) => {
        if (key === 'awards' || key === 'highlightVideoUrls') return // Handle separately
        if (value === null || value === undefined || value === '') return
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString())
        } else {
          formData.append(key, String(value))
        }
      })

      // Add arrays as JSON
      formData.append('tournamentSchedule', JSON.stringify(selectedTournaments))
      formData.append('highlightVideoUrls', JSON.stringify(filteredUrls))
      formData.append('awards', JSON.stringify(filteredAwards))

      // Add profile image if selected
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile)
      }

      const url = mode === 'edit' ? `/api/prospects/${prospect?.id}` : '/api/prospects'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${mode} prospect`)
      }

      // Redirect back
      if (mode === 'edit') {
        router.push(`/prospects/${prospect?.id}`)
      } else {
        router.push('/')
      }
      router.refresh()
    },
  })

  // UseFieldArray for awards
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'awards',
  })

  // Watch array fields for toggle buttons
  const potentialAreasOfStudy = form.watch('potentialAreasOfStudy') || []
  const desiredLevelsOfPlay = form.watch('desiredLevelsOfPlay') || []
  const desiredGeographicAreas = form.watch('desiredGeographicAreas') || []

  const handleAreaToggle = (value: string) => {
    const current = potentialAreasOfStudy as string[]
    const isSelected = current.includes(value)
    if (isSelected) {
      form.setValue('potentialAreasOfStudy', current.filter((area) => area !== value) as any)
    } else if (current.length < 3) {
      form.setValue('potentialAreasOfStudy', [...current, value] as any)
    }
  }

  const handleLevelToggle = (value: string) => {
    const current = desiredLevelsOfPlay as string[]
    const isSelected = current.includes(value)
    if (isSelected) {
      form.setValue('desiredLevelsOfPlay', current.filter((level) => level !== value) as any)
    } else if (current.length < 4) {
      form.setValue('desiredLevelsOfPlay', [...current, value] as any)
    }
  }

  const handleGeographicToggle = (value: string) => {
    const current = desiredGeographicAreas as string[]
    const isSelected = current.includes(value)
    if (isSelected) {
      form.setValue('desiredGeographicAreas', current.filter((area) => area !== value) as any)
    } else if (current.length < 3) {
      form.setValue('desiredGeographicAreas', [...current, value] as any)
    }
  }

  const handleTournamentToggle = (tournamentId: string) => {
    setSelectedTournaments(prev =>
      prev.includes(tournamentId)
        ? prev.filter(id => id !== tournamentId)
        : [...prev, tournamentId]
    )
  }

  const handleVideoUrlChange = (index: number, value: string) => {
    setVideoUrls((prev) => {
      const newUrls = [...prev]
      newUrls[index] = value
      return newUrls
    })
  }

  const addVideoUrl = () => setVideoUrls((prev) => [...prev, ''])
  const removeVideoUrl = (index: number) => setVideoUrls((prev) => prev.filter((_, i) => i !== index))

  return (
    <Card className='p-8'>
      <form onSubmit={form.handleSubmit}>
        {/* Error Alert */}
        {form.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{form.error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-3 mb-8'>
            <TabsTrigger value='basic'>Basic Info</TabsTrigger>
            <TabsTrigger value='athletic'>Athletic</TabsTrigger>
            <TabsTrigger value='academic'>Academic</TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic Info */}
          <TabsContent value='basic' className='space-y-6'>
            <ProfileImageUpload
              label='Prospect Photo'
              initialImageUrl={prospect?.profileImageUrl}
              onImageChange={setProfileImageFile}
              userType='player'
            />

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
              <FormSelectField
                control={form.control}
                name='graduationYear'
                label='Graduation Year'
                placeholder='Select year'
                options={getGraduationYearOptions()}
              />
              <FormTextField
                control={form.control}
                name='highSchool'
                label='High School'
                placeholder='High School Name'
              />
            </div>

            <FormTextField
              control={form.control}
              name='schoolTeamScheduleUrl'
              label='School Team Schedule URL'
              placeholder='https://maxpreps.com/...'
            />

            <div className='grid md:grid-cols-2 gap-5'>
              <FormTextField
                control={form.control}
                name='city'
                label='City'
                placeholder='City'
              />
              <FormSelectField
                control={form.control}
                name='state'
                label='State'
                placeholder='Select state'
                options={US_STATES_AND_TERRITORIES.map(state => ({
                  value: state.value,
                  label: state.label,
                }))}
              />
            </div>

            <H3 className='pt-4'>Contact Information</H3>

            <div className='grid md:grid-cols-2 gap-5'>
              <FormTextField
                control={form.control}
                name='phoneNumber'
                label='Phone Number'
                placeholder='(555) 555-5555'
              />
              <FormTextField
                control={form.control}
                name='xHandle'
                label='X (Twitter) Handle'
                placeholder='@username'
              />
            </div>

            <div className='grid md:grid-cols-2 gap-5'>
              <FormTextField
                control={form.control}
                name='instaHandle'
                label='Instagram Handle'
                placeholder='@username'
              />
              <FormTextField
                control={form.control}
                name='tiktokHandle'
                label='TikTok Handle'
                placeholder='@username'
              />
            </div>
          </TabsContent>

          {/* Tab 2: Athletic Profile */}
          <TabsContent value='athletic' className='space-y-6'>
            <H3>Position & Physical</H3>

            <div className='grid md:grid-cols-2 gap-5'>
              <FormSelectField
                control={form.control}
                name='primaryPosition'
                label='Primary Position'
                placeholder='Select position'
                options={getPositionOptions()}
              />
              <FormSelectField
                control={form.control}
                name='secondaryPosition'
                label='Secondary Position'
                placeholder='Select position'
                options={getPositionOptions()}
              />
            </div>

            <div className='grid md:grid-cols-2 gap-5'>
              <Controller
                control={form.control}
                name='heightInInches'
                render={({ field, fieldState }) => (
                  <FormFieldWrapper label='Height' error={fieldState.error?.message}>
                    <HeightSelect value={field.value || 0} onValueChange={field.onChange} />
                  </FormFieldWrapper>
                )}
              />
              <Controller
                control={form.control}
                name='weight'
                render={({ field, fieldState }) => (
                  <FormFieldWrapper label='Weight (lbs)' error={fieldState.error?.message}>
                    <Input
                      type='number'
                      placeholder='Weight in pounds'
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </FormFieldWrapper>
                )}
              />
            </div>

            <H3 className='pt-4'>AAU Information</H3>

            <div className='grid md:grid-cols-2 gap-5'>
              <FormTextField
                control={form.control}
                name='aauProgramName'
                label='AAU Program'
                placeholder='Program name'
              />
              <FormSelectField
                control={form.control}
                name='aauCircuit'
                label='AAU Circuit'
                placeholder='Select circuit'
                options={AAU_CIRCUITS.map(c => ({ value: c.value, label: c.label }))}
              />
            </div>

            <div className='grid md:grid-cols-2 gap-5'>
              <FormTextField
                control={form.control}
                name='aauTeamName'
                label='AAU Team'
                placeholder='Team name'
              />
              <FormTextField
                control={form.control}
                name='aauCoach'
                label='AAU Coach'
                placeholder='Coach name'
              />
            </div>

            <FormSelectField
              control={form.control}
              name='aauAgeBracket'
              label='AAU Age Bracket'
              placeholder='Select age bracket'
              options={AAU_AGE_BRACKETS.map(b => ({ value: b.value, label: b.label }))}
            />

            <H3 className='pt-4'>Statistics</H3>

            <div className='grid grid-cols-3 gap-5'>
              <FormTextField control={form.control} name='ppg' label='PPG' placeholder='Points' />
              <FormTextField control={form.control} name='rpg' label='RPG' placeholder='Rebounds' />
              <FormTextField control={form.control} name='apg' label='APG' placeholder='Assists' />
            </div>

            <FormTextField
              control={form.control}
              name='ncaaId'
              label='NCAA Eligibility Center ID'
              placeholder='XXXXXXXXXX (10 digits)'
            />

            <H3 className='pt-4'>Bio & Achievements</H3>

            <FormTextareaField
              control={form.control}
              name='bio'
              label='Bio'
              placeholder="Prospect's background and playing style"
              rows={4}
            />

            <Field className='gap-1'>
              <FieldLabel>Awards & Achievements</FieldLabel>
              {fields.length > 0 && (
                <div className='space-y-4 mt-2'>
                  {fields.map((field, index) => (
                    <div key={field.id} className='border rounded-lg p-4 space-y-3'>
                      <div className='flex items-center justify-between'>
                        <Small>Award #{index + 1}</Small>
                        <Button type='button' variant='outline' size='icon' onClick={() => remove(index)}>
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <Controller
                          control={form.control}
                          name={`awards.${index}.title`}
                          render={({ field }) => (
                            <div>
                              <FieldLabel>Title</FieldLabel>
                              <Input {...field} placeholder='Award title' />
                            </div>
                          )}
                        />
                        <Controller
                          control={form.control}
                          name={`awards.${index}.year`}
                          render={({ field }) => (
                            <div>
                              <FieldLabel>Year</FieldLabel>
                              <Input {...field} placeholder='Year' />
                            </div>
                          )}
                        />
                      </div>
                      <Controller
                        control={form.control}
                        name={`awards.${index}.description`}
                        render={({ field }) => (
                          <div>
                            <FieldLabel>Description</FieldLabel>
                            <Textarea {...field} placeholder='Description (optional)' rows={2} />
                          </div>
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}
              {fields.length < 10 && (
                <Button type='button' variant='outline' onClick={() => append({ title: '', year: '', description: '' })} className='mt-3 w-full'>
                  <Plus className='w-4 h-4 mr-2' />
                  {fields.length === 0 ? 'Add an Award' : 'Add Another Award'}
                </Button>
              )}
            </Field>

            <Field className='gap-1'>
              <FieldLabel>Highlight Video URLs</FieldLabel>
              <FieldDescription>Add links to highlight videos (YouTube, Hudl, etc.)</FieldDescription>
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
                      <Button type='button' variant='outline' size='icon' onClick={() => removeVideoUrl(index)}>
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button type='button' variant='outline' onClick={addVideoUrl} className='mt-3 w-full'>
                <Plus className='w-4 h-4 mr-2' />
                {videoUrls.length === 0 ? 'Add a Video' : 'Add Another Video'}
              </Button>
            </Field>

            {tournaments.length > 0 && (
              <Field className='gap-1'>
                <FieldLabel>Tournament Schedule</FieldLabel>
                <FieldDescription>Select tournaments this prospect will attend</FieldDescription>
                <div className='space-y-2 max-h-48 overflow-y-auto rounded-md p-3 border mt-2'>
                  {tournaments.map(tournament => (
                    <label key={tournament.id} className='flex items-center space-x-2 cursor-pointer'>
                      <Checkbox
                        checked={selectedTournaments.includes(tournament.id.toString())}
                        onCheckedChange={() => handleTournamentToggle(tournament.id.toString())}
                      />
                      <span className='text-sm'>{tournament.name}</span>
                    </label>
                  ))}
                </div>
              </Field>
            )}
          </TabsContent>

          {/* Tab 3: Academic & Preferences */}
          <TabsContent value='academic' className='space-y-6'>
            <H3>Academic Information</H3>

            <div className='grid md:grid-cols-2 gap-5'>
              <FormTextField control={form.control} name='unweightedGpa' label='Unweighted GPA' placeholder='0.00 - 4.00' />
              <FormTextField control={form.control} name='weightedGpa' label='Weighted GPA' placeholder='0.00 - 5.00' />
            </div>

            <Field className='gap-1'>
              <FieldLabel>Potential Areas of Study</FieldLabel>
              <FieldDescription>Select up to 3 areas</FieldDescription>
              <div className='grid md:grid-cols-2 gap-3 mt-2'>
                {AREAS_OF_STUDY.map((area) => {
                  const isSelected = (potentialAreasOfStudy as string[]).includes(area.value)
                  const isMaxSelected = potentialAreasOfStudy.length >= 3
                  return (
                    <ToggleButton
                      key={area.value}
                      onClick={() => handleAreaToggle(area.value)}
                      isSelected={isSelected}
                      isDisabled={!isSelected && isMaxSelected}
                      isMaxSelected={isMaxSelected}
                    >
                      {area.label}
                    </ToggleButton>
                  )
                })}
              </div>
              <Small className='mt-2'>{potentialAreasOfStudy.length} of 3 selected</Small>
            </Field>

            <H3 className='pt-4'>College Preferences</H3>

            <Field className='gap-1'>
              <FieldLabel>Desired Levels of Play</FieldLabel>
              <FieldDescription>Select up to 4 levels</FieldDescription>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mt-2'>
                {LEVELS_OF_PLAY.map((level) => {
                  const isSelected = (desiredLevelsOfPlay as string[]).includes(level.value)
                  const isMaxSelected = desiredLevelsOfPlay.length >= 4
                  return (
                    <ToggleButton
                      key={level.value}
                      onClick={() => handleLevelToggle(level.value)}
                      isSelected={isSelected}
                      isDisabled={!isSelected && isMaxSelected}
                      isMaxSelected={isMaxSelected}
                    >
                      {level.label}
                    </ToggleButton>
                  )
                })}
              </div>
              <Small className='mt-2'>{desiredLevelsOfPlay.length} of 4 selected</Small>
            </Field>

            <Field className='gap-1'>
              <FieldLabel>Desired Geographic Areas</FieldLabel>
              <FieldDescription>Select up to 3 regions</FieldDescription>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-3 mt-2'>
                {GEOGRAPHIC_AREAS.map((area) => {
                  const isSelected = (desiredGeographicAreas as string[]).includes(area.value)
                  const isMaxSelected = desiredGeographicAreas.length >= 3
                  return (
                    <ToggleButton
                      key={area.value}
                      onClick={() => handleGeographicToggle(area.value)}
                      isSelected={isSelected}
                      isDisabled={!isSelected && isMaxSelected}
                      isMaxSelected={isMaxSelected}
                    >
                      {area.label}
                    </ToggleButton>
                  )
                })}
              </div>
              <Small className='mt-2'>{desiredGeographicAreas.length} of 3 selected</Small>
            </Field>

            <FormSelectField
              control={form.control}
              name='desiredDistanceFromHome'
              label='Distance from Home'
              placeholder='Select preference'
              options={DISTANCE_FROM_HOME_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
            />

            <Field className='gap-1'>
              <FieldLabel>Special Interests</FieldLabel>
              <div className='space-y-3 mt-2'>
                {[
                  { name: 'interestedInMilitaryAcademies', label: 'Military Academies' },
                  { name: 'interestedInUltraHighAcademics', label: 'Ultra High Academics (Ivy League, etc.)' },
                  { name: 'interestedInFaithBased', label: 'Faith-Based Schools' },
                  { name: 'interestedInAllGirls', label: 'All-Girls Schools' },
                  { name: 'interestedInHBCU', label: 'HBCUs' },
                ].map(({ name, label }) => (
                  <div key={name} className='flex items-center gap-3'>
                    <Checkbox
                      id={name}
                      checked={form.watch(name as any)}
                      onCheckedChange={(checked) => form.setValue(name as any, checked as boolean)}
                    />
                    <label htmlFor={name} className='text-sm font-medium cursor-pointer'>{label}</label>
                  </div>
                ))}
              </div>
            </Field>

            <H3 className='pt-4'>Private Notes</H3>

            <FormTextareaField
              control={form.control}
              name='notes'
              label='Your Notes'
              description='Only visible to you'
              placeholder='Add any private notes about this prospect...'
              rows={4}
            />
          </TabsContent>
        </Tabs>

        <div className='flex gap-3 pt-8 border-t mt-8'>
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
            {form.isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Prospect'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
