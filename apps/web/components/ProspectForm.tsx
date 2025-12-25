'use client'

import { useState, useEffect } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldSet,
  FieldLegend,
  FieldGroup,
} from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { useRouter } from 'next/navigation'
import { getGraduationYearOptions } from '@/lib/zod/GraduationYears'
import { HeightSelect } from '@/components/HeightSelect'

interface ProspectFormProps {
  coachId?: string | number
}

export function ProspectForm({ coachId }: ProspectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [tournaments, setTournaments] = useState<any[]>([])
  const [selectedTournaments, setSelectedTournaments] = useState<string[]>([])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    uniformNumber: '',
    graduationYear: (new Date().getFullYear() + 1).toString(),
    heightInInches: 0,
    weight: '',
    highSchool: '',
    aauProgram: '',
    twitterHandle: '',
    phoneNumber: '',
    notes: '',
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/prospects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          coach: coachId,
          tournamentSchedule: selectedTournaments,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create prospect')
      }

      // Redirect back to dashboard
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error creating prospect:', error)
      alert('Failed to create prospect. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTournamentToggle = (tournamentId: string) => {
    setSelectedTournaments((prev) =>
      prev.includes(tournamentId)
        ? prev.filter((id) => id !== tournamentId)
        : [...prev, tournamentId]
    )
  }

  return (
    <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-8 max-w-md mx-auto'>
      <form onSubmit={handleSubmit}>
        <FieldSet>
          <FieldLegend className="mb-6">Prospect Information</FieldLegend>
          <FieldGroup>
            <Field className='gap-1'>
              <FieldLabel htmlFor='name'>First name</FieldLabel>
              <Input
                id='firstName'
                required
                autoFocus
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder='Required'
              />
            </Field>
            <Field className='gap-1'>
              <FieldLabel htmlFor='name'>Last name</FieldLabel>
              <Input
                id='lastName'
                required
                autoFocus
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder='Required'
              />
            </Field>
            <div className='grid md:grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='uniformNumber'>Uniform Number</FieldLabel>
                <Input
                  id='uniformNumber'
                  value={formData.uniformNumber}
                  onChange={(e) => setFormData({ ...formData, uniformNumber: e.target.value })}
                  placeholder='23'
                />
              </Field>
              <Field className='gap-1'>
                <FieldLabel htmlFor='graduationYear'>Graduation Year</FieldLabel>
                <Select
                  value={formData.graduationYear}
                  onValueChange={(value) =>
                    setFormData({ ...formData, graduationYear: value })
                  }
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
              </Field>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='height'>Height</FieldLabel>
                <HeightSelect
                  value={formData.heightInInches || undefined}
                  onValueChange={(value) => setFormData({ ...formData, heightInInches: value })}
                />
              </Field>
              <Field className='gap-1'>
                <FieldLabel htmlFor='weight'>Weight (lbs)</FieldLabel>
                <Input
                  id='weight'
                  type='number'
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="lbs"
                />
              </Field>
            </div>
            <div className='grid md:grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='highSchool'>High School</FieldLabel>
                <Input
                  id='highSchool'
                  value={formData.highSchool}
                  onChange={(e) => setFormData({ ...formData, highSchool: e.target.value })}
                  placeholder='High School Name'
                />
              </Field>
              <Field className='gap-1'>
                <FieldLabel htmlFor='aauProgram'>AAU Program</FieldLabel>
                <Input
                  id='aauProgram'
                  value={formData.aauProgram}
                  onChange={(e) => setFormData({ ...formData, aauProgram: e.target.value })}
                  placeholder='AAU Program Name'
                />
              </Field>
            </div>
            <div className='grid md:grid-cols-2 gap-4'>
              <Field className='gap-1'>
                <FieldLabel htmlFor='twitterHandle'>Twitter/X Handle</FieldLabel>
                <Input
                  id='twitterHandle'
                  value={formData.twitterHandle}
                  onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                  placeholder='@username'
                />
              </Field>
              <Field className='gap-1'>
                <FieldLabel htmlFor='phoneNumber'>Phone Number</FieldLabel>
                <Input
                  id='phoneNumber'
                  type='tel'
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder='(555) 555-5555'
                />
              </Field>
            </div>
            {tournaments.length > 0 && (
              <Field className='gap-1'>
                <FieldLabel>Tournament Schedule</FieldLabel>
                <FieldDescription>Select all tournaments this prospect will attend.</FieldDescription>
                <div className='space-y-2 max-h-48 overflow-y-auto rounded-md p-3 border'>
                  {tournaments.map((tournament) => (
                    <label key={tournament.id} className='flex items-center space-x-2 cursor-pointer'>
                      <Checkbox
                        checked={selectedTournaments.includes(tournament.id)}
                        onCheckedChange={() => handleTournamentToggle(tournament.id)}
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
            <Field className='gap-1'>
              <FieldLabel htmlFor='notes'>Private Notes</FieldLabel>
              <Textarea
                id='notes'
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder='Add any private notes about this prospect...'
              />
              <FieldDescription>Only visible to you.</FieldDescription>
            </Field>
            <div className='flex gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                className='flex-1'
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='flex-1 bg-purple-600 hover:bg-purple-700'
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Prospect'}
              </Button>
            </div>
          </FieldGroup>
        </FieldSet>
      </form>
    </Card>
  )
}
