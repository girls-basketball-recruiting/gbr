'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Textarea } from '@workspace/ui/components/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'

export function PlayerOnboardingForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    graduationYear: '',
    city: '',
    state: '',
    highSchool: '',
    height: '',
    weightedGpa: '',
    unweightedGpa: '',
    primaryPosition: '',
    secondaryPosition: '',
    bio: '',
    highlightVideo: '',
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/profile/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create profile')
      }

      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className='bg-slate-800 border-slate-700 max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='text-white'>Player Profile</CardTitle>
        <CardDescription className='text-slate-400'>
          Tell coaches about yourself and your basketball journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {error && (
            <div className='bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded'>
              {error}
            </div>
          )}

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='firstName' className='text-slate-200'>
                First Name *
              </Label>
              <Input
                id='firstName'
                name='firstName'
                value={formData.firstName}
                onChange={handleChange}
                required
                className='bg-slate-900 border-slate-600 text-white'
              />
            </div>
            <div>
              <Label htmlFor='lastName' className='text-slate-200'>
                Last Name *
              </Label>
              <Input
                id='lastName'
                name='lastName'
                value={formData.lastName}
                onChange={handleChange}
                required
                className='bg-slate-900 border-slate-600 text-white'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='graduationYear' className='text-slate-200'>
                Graduation Year *
              </Label>
              <Input
                id='graduationYear'
                name='graduationYear'
                type='number'
                value={formData.graduationYear}
                onChange={handleChange}
                required
                placeholder='2026'
                className='bg-slate-900 border-slate-600 text-white'
              />
            </div>
            <div>
              <Label htmlFor='height' className='text-slate-200'>
                Height
              </Label>
              <Input
                id='height'
                name='height'
                value={formData.height}
                onChange={handleChange}
                placeholder='5&apos;10"'
                className='bg-slate-900 border-slate-600 text-white'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='highSchool' className='text-slate-200'>
              High School *
            </Label>
            <Input
              id='highSchool'
              name='highSchool'
              value={formData.highSchool}
              onChange={handleChange}
              required
              className='bg-slate-900 border-slate-600 text-white'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='city' className='text-slate-200'>
                City
              </Label>
              <Input
                id='city'
                name='city'
                value={formData.city}
                onChange={handleChange}
                className='bg-slate-900 border-slate-600 text-white'
              />
            </div>
            <div>
              <Label htmlFor='state' className='text-slate-200'>
                State
              </Label>
              <Input
                id='state'
                name='state'
                value={formData.state}
                onChange={handleChange}
                placeholder='CA'
                className='bg-slate-900 border-slate-600 text-white'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='primaryPosition' className='text-slate-200'>
                Primary Position *
              </Label>
              <Select
                value={formData.primaryPosition}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, primaryPosition: value }))
                }
              >
                <SelectTrigger className='bg-slate-900 border-slate-600 text-white'>
                  <SelectValue placeholder='Select position' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='point-guard'>Point Guard</SelectItem>
                  <SelectItem value='shooting-guard'>Shooting Guard</SelectItem>
                  <SelectItem value='small-forward'>Small Forward</SelectItem>
                  <SelectItem value='power-forward'>Power Forward</SelectItem>
                  <SelectItem value='center'>Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='secondaryPosition' className='text-slate-200'>
                Secondary Position
              </Label>
              <Select
                value={formData.secondaryPosition}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, secondaryPosition: value }))
                }
              >
                <SelectTrigger className='bg-slate-900 border-slate-600 text-white'>
                  <SelectValue placeholder='Select position' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='point-guard'>Point Guard</SelectItem>
                  <SelectItem value='shooting-guard'>Shooting Guard</SelectItem>
                  <SelectItem value='small-forward'>Small Forward</SelectItem>
                  <SelectItem value='power-forward'>Power Forward</SelectItem>
                  <SelectItem value='center'>Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='weightedGpa' className='text-slate-200'>
                Weighted GPA
              </Label>
              <Input
                id='weightedGpa'
                name='weightedGpa'
                type='number'
                step='0.01'
                value={formData.weightedGpa}
                onChange={handleChange}
                placeholder='4.0'
                className='bg-slate-900 border-slate-600 text-white'
              />
            </div>
            <div>
              <Label htmlFor='unweightedGpa' className='text-slate-200'>
                Unweighted GPA
              </Label>
              <Input
                id='unweightedGpa'
                name='unweightedGpa'
                type='number'
                step='0.01'
                value={formData.unweightedGpa}
                onChange={handleChange}
                placeholder='3.8'
                className='bg-slate-900 border-slate-600 text-white'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='bio' className='text-slate-200'>
              About You
            </Label>
            <Textarea
              id='bio'
              name='bio'
              value={formData.bio}
              onChange={handleChange}
              placeholder='Tell coaches about your playing style, achievements, and goals...'
              rows={4}
              className='bg-slate-900 border-slate-600 text-white'
            />
          </div>

          <div>
            <Label htmlFor='highlightVideo' className='text-slate-200'>
              Highlight Video URL
            </Label>
            <Input
              id='highlightVideo'
              name='highlightVideo'
              type='url'
              value={formData.highlightVideo}
              onChange={handleChange}
              placeholder='https://youtube.com/...'
              className='bg-slate-900 border-slate-600 text-white'
            />
          </div>

          <Button
            type='submit'
            disabled={isSubmitting}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white'
          >
            {isSubmitting ? 'Creating Profile...' : 'Complete Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
