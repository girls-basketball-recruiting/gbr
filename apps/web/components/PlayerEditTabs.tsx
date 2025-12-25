'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { Field, FieldLabel, FieldDescription, FieldError } from '@workspace/ui/components/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { HeightSelect } from '@/components/HeightSelect'
import { Plus, Trash2 } from 'lucide-react'
import type { Player } from '@/payload-types'

// Zod Schemas
import { PlayerSchema } from '@/lib/zod/Players' // Inferring Player type from Zod schema
import { getGraduationYearOptions } from '@/lib/zod/GraduationYears'
import { getPositionOptions } from '@/lib/zod/Positions' // Assuming getPositionOptions is still needed for UI labels
import { US_STATES_AND_TERRITORIES } from '@/lib/zod/States'
import { AAU_CIRCUITS } from '@/lib/zod/AauCircuits'
// import { AREAS_OF_STUDY } from '@/lib/zod/AreasOfStudy'
// import { LEVELS_OF_PLAY } from '@/lib/zod/LevelsOfPlay'
// import { GEOGRAPHIC_AREAS } from '@/lib/zod/GeographicAreas'
import { DISTANCE_FROM_HOME_OPTIONS } from '@/lib/zod/DistanceFromHome'

// React Hook Form
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProfileImageUpload } from './ui/ProfileImageUpload'

const TABS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'aau', label: 'AAU & Awards' },
  { id: 'contact', label: 'Contact' },
  { id: 'academic', label: 'Academic' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'stats', label: 'Stats & Media' },
] as const

type TabId = typeof TABS[number]['id']

interface PlayerEditTabsProps {
  profile: Player
}

export function PlayerEditTabs({ profile }: PlayerEditTabsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Player>({
    resolver: zodResolver(PlayerSchema) as any,
    defaultValues: profile,
    mode: 'onTouched',
  });

  const onSubmit = async (data: Player) => {
    setIsSubmitting(true)
    setSubmissionError(null)

    try {
      const formDataToSend = new FormData()

      // Append all form data that is not a relationship or file
      Object.entries(data).forEach(([key, value]) => {
        // Handle specific relationship fields (user, profileImage, tournamentSchedule) which are now strings in Zod
        // But might need special handling for Payload API if it expects numbers for relationships
        // For now, we send the string as is, assuming API handles conversion or expects string IDs.
        if (key === 'user' && value) {
            formDataToSend.append(key, value as string);
        }
        else if (key === 'profileImage') {
            // profileImage is handled by profileImageFile or existing ID, not from 'data' directly
            return;
        }
        else if (key === 'tournamentSchedule' && Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value)); // Send array of string IDs
        }
        else if (key === 'highlightVideoUrls' && Array.isArray(value)) {
            value.forEach((item: any, index: number) => {
                const url = typeof item === 'string' ? item : item.url;
                formDataToSend.append(`${key}[${index}][url]`, url);
            });
        }
        else if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value));
          } else if (typeof value === 'boolean') {
            formDataToSend.append(key, value ? 'true' : 'false');
          } else if (typeof value === 'number') {
            formDataToSend.append(key, value.toString());
          }
          // No need for 'instanceof Date' check, dates should be ISO strings by now
          else {
            formDataToSend.append(key, String(value));
          }
        }
      })

      // Add profile image file if changed
      if (profileImageFile) {
        formDataToSend.append('profileImageUrl', profileImageFile)
      } else if (profile.profileImageUrl) {
        // If no new file, but existing image, send its ID as a string
        formDataToSend.append('profileImageUrl', profile.profileImageUrl);
      }

      const response = await fetch(`/api/profile/player/${profile.id}`, {
        method: 'PUT',
        body: formDataToSend,
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update profile')
      }

      // Success - redirect to profile view
      router.push('/profile')
      router.refresh(); // Refresh page data after successful update
    } catch (err) {
      setSubmissionError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className='space-y-6'>
            <ProfileImageUpload
              label='Player Photo'
              initialImageUrl={undefined}
              onImageChange={setProfileImageFile}
              userType='player'
            />

            {/* Name */}
            <div className='grid grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='firstName'>First Name *</FieldLabel>
                <Input
                  id='firstName'
                  {...register('firstName')}
                  required
                />
                {errors.firstName && <FieldError>{errors.firstName.message}</FieldError>}
              </Field>
              <Field className='gap-1'>
                <FieldLabel htmlFor='lastName'>Last Name *</FieldLabel>
                <Input
                  id='lastName'
                  {...register('lastName')}
                  required
                />
                {errors.lastName && <FieldError>{errors.lastName.message}</FieldError>}
              </Field>
            </div>

            {/* Graduation Year & Height */}
            <div className='grid grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='graduationYear'>Graduation Year *</FieldLabel>
                <Controller
                  control={control}
                  name='graduationYear'
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()} // Ensure string value for Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select year' />
                      </SelectTrigger>
                      <SelectContent>
                        {getGraduationYearOptions().map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.graduationYear && <FieldError>{errors.graduationYear.message}</FieldError>}
              </Field>
              <div className='grid grid-cols-2 gap-2'>
                <Field className='gap-1'>
                  <FieldLabel>Height</FieldLabel>
                  <Controller
                    control={control}
                    name='heightInInches'
                    render={({ field }) => (
                      <HeightSelect
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      />
                    )}
                  />
                  {errors.heightInInches && <FieldError>{errors.heightInInches.message}</FieldError>}
                </Field>
                <Field className='gap-1'>
                  <FieldLabel htmlFor='weight'>Weight (lbs)</FieldLabel>
                  <Input
                    id='weight'
                    {...register('weight', { valueAsNumber: true })}
                    type='number'
                    placeholder='lbs'
                  />
                  {errors.weight && <FieldError>{errors.weight.message}</FieldError>}
                </Field>
              </div>
            </div>

            {/* Positions */}
            <div className='grid grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='primaryPosition'>Primary Position *</FieldLabel>
                <Controller
                  control={control}
                  name='primaryPosition'
                  render={({ field }) => (
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select position' />
                      </SelectTrigger>
                      <SelectContent>
                        {getPositionOptions().map((position) => (
                          <SelectItem key={position.value} value={position.value}>
                            {position.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.primaryPosition && <FieldError>{errors.primaryPosition.message}</FieldError>}
              </Field>
              <Field className='gap-1'>
                <FieldLabel htmlFor='secondaryPosition'>Secondary Position</FieldLabel>
                <Controller
                  control={control}
                  name='secondaryPosition'
                  render={({ field }) => (
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select position' />
                      </SelectTrigger>
                      <SelectContent>
                        {getPositionOptions().map((position) => (
                          <SelectItem key={position.value} value={position.value}>
                            {position.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.secondaryPosition && <FieldError>{errors.secondaryPosition.message}</FieldError>}
              </Field>
            </div>

            {/* High School */}
            <Field className='gap-1'>
              <FieldLabel htmlFor='highSchool'>High School *</FieldLabel>
              <Input
                id='highSchool'
                {...register('highSchool')}
                required
              />
              {errors.highSchool && <FieldError>{errors.highSchool.message}</FieldError>}
            </Field>

            {/* Location */}
            <div className='grid grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='city'>City</FieldLabel>
                <Input id='city' {...register('city')} />
                {errors.city && <FieldError>{errors.city.message}</FieldError>}
              </Field>
              <Field className='gap-1'>
                <FieldLabel htmlFor='state'>State</FieldLabel>
                <Controller
                  control={control}
                  name='state'
                  render={({ field }) => (
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select state' />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES_AND_TERRITORIES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.state && <FieldError>{errors.state.message}</FieldError>}
              </Field>
            </div>
          </div>
        )

      case 'aau':
        return (
          <div className='space-y-6'>
            <Field className='gap-1'>
              <FieldLabel htmlFor='aauProgram'>AAU Program</FieldLabel>
              <Input
                id='aauProgram'
                {...register('aauProgramName')}
                placeholder='e.g., Nike Team Florida'
              />
              {errors.aauProgramName && <FieldError>{errors.aauProgramName.message}</FieldError>}
            </Field>

            <Field className='gap-1'>
              <FieldLabel htmlFor='aauTeam'>AAU Team</FieldLabel>
              <Input
                id='aauTeam'
                {...register('aauTeamName')}
              />
              {errors.aauTeamName && <FieldError>{errors.aauTeamName.message}</FieldError>}
            </Field>

            <Field className='gap-1'>
              <FieldLabel htmlFor='aauCircuit'>AAU Circuit</FieldLabel>
              <Controller
                control={control}
                name='aauCircuit'
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
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
                )}
              />
              {errors.aauCircuit && <FieldError>{errors.aauCircuit.message}</FieldError>}
            </Field>

            <Field className='gap-1'>
              <FieldLabel htmlFor='aauCoach'>AAU Coach</FieldLabel>
              <Input
                id='aauCoach'
                {...register('aauCoach')}
              />
              {errors.aauCoach && <FieldError>{errors.aauCoach.message}</FieldError>}
            </Field>

            <Field className='gap-1'>
              <FieldLabel>Awards & Achievements</FieldLabel>
              <FieldDescription>List your athletic awards, honors, and achievements</FieldDescription>
              <Controller
                control={control}
                name="awards"
                render={({ field }) => (
                  <div className='space-y-3 mt-2'>
                    {(field.value || []).map((award: any, index: number) => (
                      <div key={index} className='flex gap-2'>
                        <Input
                          value={award.title}
                          onChange={(e) => {
                            const newAwards = [...(field.value || [])];
                            newAwards[index] = { year: award.year, title: e.target.value };
                            field.onChange(newAwards);
                          }}
                          placeholder='e.g. 1st Team All-State'
                          className='flex-1'
                        />
                        {(field.value || []).length > 1 && (
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={() => {
                              const newAwards = [...(field.value || [])];
                              newAwards.splice(index, 1);
                              field.onChange(newAwards);
                            }}
                            className='shrink-0'
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button 
                      type='button' 
                      variant='outline' 
                      onClick={() => field.onChange([...(field.value || []), { title: '' }])} 
                      className='mt-3 w-full'
                      disabled={(field.value || []).length >= 10}
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Add Another Award
                    </Button>
                  </div>
                )}
              />
              {errors.awards && <FieldError>{errors.awards.message}</FieldError>}
            </Field>
          </div>
        )

      case 'contact':
        return (
          <div className='space-y-6'>
            <Field className='gap-1'>
              <FieldLabel htmlFor='phoneNumber'>Phone Number</FieldLabel>
              <Input
                id='phoneNumber'
                {...register('phoneNumber')}
                type='tel'
                placeholder='(555) 123-4567'
              />
              {errors.phoneNumber && <FieldError>{errors.phoneNumber.message}</FieldError>}
            </Field>

            <Field className='gap-1'>
              <FieldLabel htmlFor='xHandle'>X (Twitter) Handle</FieldLabel>
              <Input
                id='xHandle'
                {...register('xHandle')}
                placeholder='@yourhandle'
              />
              {errors.xHandle && <FieldError>{errors.xHandle.message}</FieldError>}
            </Field>

            <Field className='gap-1'>
              <FieldLabel htmlFor='instaHandle'>Instagram Handle</FieldLabel>
              <Input
                id='instaHandle'
                {...register('instaHandle')}
                placeholder='@yourhandle'
              />
              {errors.instaHandle && <FieldError>{errors.instaHandle.message}</FieldError>}
            </Field>

            <Field className='gap-1'>
              <FieldLabel htmlFor='ncaaId'>NCAA Eligibility Center ID</FieldLabel>
              <Input
                id='ncaaId'
                {...register('ncaaId')}
                placeholder='NCAA ID number'
              />
              {errors.ncaaId && <FieldError>{errors.ncaaId.message}</FieldError>}
            </Field>
          </div>
        )

      case 'academic':
        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='unweightedGpa'>Unweighted GPA</FieldLabel>
                <Input
                  id='unweightedGpa'
                  {...register('unweightedGpa', { valueAsNumber: true })}
                  type='number'
                  step='0.01'
                  min='0'
                  max='4.0'
                  placeholder='0.00 - 4.00'
                />
                {errors.unweightedGpa && <FieldError>{errors.unweightedGpa.message}</FieldError>}
              </Field>
              <Field className='gap-1'>
                <FieldLabel htmlFor='weightedGpa'>Weighted GPA</FieldLabel>
                <Input
                  id='weightedGpa'
                  {...register('weightedGpa', { valueAsNumber: true })}
                  type='number'
                  step='0.01'
                  min='0'
                  max='5.0'
                  placeholder='0.00 - 5.00'
                />
                {errors.weightedGpa && <FieldError>{errors.weightedGpa.message}</FieldError>}
              </Field>
            </div>
          </div>
        )

      case 'preferences':
        return (
          <div className='space-y-6'>

            {/* Distance from Home */}
            <Field className='gap-1'>
              <FieldLabel htmlFor='desiredDistanceFromHome'>Distance from Home</FieldLabel>
              <Controller
                control={control}
                name='desiredDistanceFromHome'
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
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
                )}
              />
              {errors.desiredDistanceFromHome && <FieldError>{errors.desiredDistanceFromHome.message}</FieldError>}
            </Field>

            {/* Special Interests */}
            {/* <Field className='gap-1'>
              <FieldLabel>Special Interests</FieldLabel>
              <FieldDescription>Select any that apply to you</FieldDescription>
              <div className='space-y-3 mt-2'>
                <div className='flex items-center gap-3'>
                  <Controller
                    control={control}
                    name='interestedInMilitaryAcademies'
                    render={({ field }) => (
                      <Checkbox
                        id='interestedInMilitaryAcademies'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor='interestedInMilitaryAcademies'
                    className='text-sm font-medium text-slate-900 dark:text-white cursor-pointer'
                  >
                    Interested in Military Academies
                  </label>
                </div>
                <div className='flex items-center gap-3'>
                  <Controller
                    control={control}
                    name='interestedInUltraHighAcademics'
                    render={({ field }) => (
                      <Checkbox
                        id='interestedInUltraHighAcademics'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor='interestedInUltraHighAcademics'
                    className='text-sm font-medium text-slate-900 dark:text-white cursor-pointer'
                  >
                    Interested in Ultra High Academics (Ivy League, etc.)
                  </label>
                </div>
                <div className='flex items-center gap-3'>
                  <Controller
                    control={control}
                    name='interestedInFaithBased'
                    render={({ field }) => (
                      <Checkbox
                        id='interestedInFaithBased'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor='interestedInFaithBased'
                    className='text-sm font-medium text-slate-900 dark:text-white cursor-pointer'
                  >
                    Interested in Faith-Based Schools
                  </label>
                </div>
                <div className='flex items-center gap-3'>
                  <Controller
                    control={control}
                    name='interestedInAllGirls'
                    render={({ field }) => (
                      <Checkbox
                        id='interestedInAllGirls'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor='interestedInAllGirls'
                    className='text-sm font-medium text-slate-900 dark:text-white cursor-pointer'
                  >
                    Interested in All-Girls Schools
                  </label>
                </div>
                <div className='flex items-center gap-3'>
                  <Controller
                    control={control}
                    name='interestedInHBCU'
                    render={({ field }) => (
                      <Checkbox
                        id='interestedInHBCU'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor='interestedInHBCU'
                    className='text-sm font-medium text-slate-900 dark:text-white cursor-pointer'
                  >
                    Interested in HBCUs
                  </label>
                </div>
              </div>
              {errors.interestedInMilitaryAcademies && <FieldError>{errors.interestedInMilitaryAcademies.message}</FieldError>}
              {errors.interestedInUltraHighAcademics && <FieldError>{errors.interestedInUltraHighAcademics.message}</FieldError>}
              {errors.interestedInFaithBased && <FieldError>{errors.interestedInFaithBased.message}</FieldError>}
              {errors.interestedInAllGirls && <FieldError>{errors.interestedInAllGirls.message}</FieldError>}
              {errors.interestedInHBCU && <FieldError>{errors.interestedInHBCU.message}</FieldError>}
            </Field> */}
          </div>
        )

      case 'stats':
        return (
          <div className='space-y-6'>
            {/* Stats */}
            <div className='grid grid-cols-3 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='ppg'>PPG</FieldLabel>
                <Input
                  id='ppg'
                  {...register('ppg', { valueAsNumber: true })}
                  type='number'
                  step='0.1'
                  min='0'
                  placeholder='Points per game'
                />
                {errors.ppg && <FieldError>{errors.ppg.message}</FieldError>}
              </Field>
              <Field className='gap-1'>
                <FieldLabel htmlFor='rpg'>RPG</FieldLabel>
                <Input
                  id='rpg'
                  {...register('rpg', { valueAsNumber: true })}
                  type='number'
                  step='0.1'
                  min='0'
                  placeholder='Rebounds per game'
                />
                {errors.rpg && <FieldError>{errors.rpg.message}</FieldError>}
              </Field>
              <Field className='gap-1'>
                <FieldLabel htmlFor='apg'>APG</FieldLabel>
                <Input
                  id='apg'
                  {...register('apg', { valueAsNumber: true })}
                  type='number'
                  step='0.1'
                  min='0'
                  placeholder='Assists per game'
                />
                {errors.apg && <FieldError>{errors.apg.message}</FieldError>}
              </Field>
            </div>

            {/* Bio */}
            <Field className='gap-1'>
              <FieldLabel htmlFor='bio'>Player Bio</FieldLabel>
              <Textarea
                id='bio'
                {...register('bio')}
                placeholder='Tell coaches about yourself, your playing style, and what makes you unique...'
                rows={6}
              />
              <FieldDescription>
                This is your chance to stand out - share your story and what drives you
              </FieldDescription>
              {errors.bio && <FieldError>{errors.bio.message}</FieldError>}
            </Field>

            {/* Highlight Videos */}
            <Field className='gap-1'>
              <FieldLabel>Highlight Video URLs</FieldLabel>
              <FieldDescription>Add links to your highlight videos (YouTube, Hudl, etc.)</FieldDescription>
              <Controller
                control={control}
                name="highlightVideoUrls"
                render={({ field }) => (
                  <div className='space-y-3 mt-2'>
                    {(field.value || []).map((video, index) => (
                      <div key={index} className='flex gap-2'>
                        <Input
                          type='url'
                          value={video.url}
                          onChange={(e) => {
                            const newUrls = [...(field.value || [])];
                            newUrls[index] = { url: e.target.value };
                            field.onChange(newUrls);
                          }}
                          placeholder='https://youtube.com/watch?v=...'
                          className='flex-1'
                        />
                        {(field.value || []).length > 1 && (
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={() => {
                              const newUrls = [...(field.value || [])];
                              newUrls.splice(index, 1);
                              field.onChange(newUrls);
                            }}
                            className='shrink-0'
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type='button' variant='outline' onClick={() => field.onChange([...(field.value || []), { url: '' }])} className='mt-3 w-full'>
                      <Plus className='w-4 h-4 mr-2' />
                      Add Another Video
                    </Button>
                  </div>
                )}
              />
              {errors.highlightVideoUrls && <FieldError>{errors.highlightVideoUrls.message}</FieldError>}
            </Field>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'>
        {/* Tab Navigation */}
        <div className='border-b border-slate-200 dark:border-slate-700'>
          <nav className='flex flex-wrap -mb-px'>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type='button'
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className='p-8'>
          {submissionError && <FieldError className='mb-6'>{submissionError}</FieldError>}
          {renderTabContent()}
        </div>

        {/* Action Buttons */}
        <div className='border-t border-slate-200 dark:border-slate-700 px-8 py-6'>
          <div className='flex justify-between gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.push('/profile')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting} className='bg-blue-600 hover:bg-blue-700'>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>
    </form>
  )
}