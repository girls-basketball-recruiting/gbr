'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

export function CoachOnboardingForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    university: '',
    programName: '',
    position: '',
    division: '',
    state: '',
    region: '',
    email: '',
    phone: '',
    bio: '',
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
      const response = await fetch('/api/profile/coach', {
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
        <CardTitle className='text-white'>Coach Profile</CardTitle>
        <CardDescription className='text-slate-400'>
          Tell players about your program and recruiting needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {error && (
            <div className='bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded'>
              {error}
            </div>
          )}

          <div>
            <Label htmlFor='name' className='text-slate-200'>
              Your Name *
            </Label>
            <Input
              id='name'
              name='name'
              value={formData.name}
              onChange={handleChange}
              required
              className='bg-slate-900 border-slate-600 text-white'
            />
          </div>

          <div>
            <Label htmlFor='university' className='text-slate-200'>
              University *
            </Label>
            <Input
              id='university'
              name='university'
              value={formData.university}
              onChange={handleChange}
              required
              className='bg-slate-900 border-slate-600 text-white'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='programName' className='text-slate-200'>
                Program Name
              </Label>
              <Input
                id='programName'
                name='programName'
                value={formData.programName}
                onChange={handleChange}
                placeholder="Women's Basketball"
                className='bg-slate-900 border-slate-600 text-white'
              />
            </div>
            <div>
              <Label htmlFor='position' className='text-slate-200'>
                Position
              </Label>
              <Input
                id='position'
                name='position'
                value={formData.position}
                onChange={handleChange}
                placeholder='Head Coach, Assistant Coach, etc.'
                className='bg-slate-900 border-slate-600 text-white'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='division' className='text-slate-200'>
                Division
              </Label>
              <Select
                value={formData.division}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, division: value }))
                }
              >
                <SelectTrigger className='bg-slate-900 border-slate-600 text-white'>
                  <SelectValue placeholder='Select division' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='d1'>NCAA D1</SelectItem>
                  <SelectItem value='d2'>NCAA D2</SelectItem>
                  <SelectItem value='d3'>NCAA D3</SelectItem>
                  <SelectItem value='naia'>NAIA</SelectItem>
                  <SelectItem value='juco'>JUCO</SelectItem>
                  <SelectItem value='other'>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='region' className='text-slate-200'>
                Region
              </Label>
              <Select
                value={formData.region}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, region: value }))
                }
              >
                <SelectTrigger className='bg-slate-900 border-slate-600 text-white'>
                  <SelectValue placeholder='Select region' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='new-england'>New England</SelectItem>
                  <SelectItem value='mid-atlantic'>Mid-Atlantic</SelectItem>
                  <SelectItem value='southeast'>Southeast</SelectItem>
                  <SelectItem value='southwest'>Southwest</SelectItem>
                  <SelectItem value='midwest'>Midwest</SelectItem>
                  <SelectItem value='mountain-west'>Mountain West</SelectItem>
                  <SelectItem value='west-coast'>West Coast</SelectItem>
                  <SelectItem value='pacific-northwest'>
                    Pacific Northwest
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='email' className='text-slate-200'>
                Contact Email
              </Label>
              <Input
                id='email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleChange}
                className='bg-slate-900 border-slate-600 text-white'
              />
            </div>
            <div>
              <Label htmlFor='phone' className='text-slate-200'>
                Phone Number
              </Label>
              <Input
                id='phone'
                name='phone'
                type='tel'
                value={formData.phone}
                onChange={handleChange}
                className='bg-slate-900 border-slate-600 text-white'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='bio' className='text-slate-200'>
              About Your Program
            </Label>
            <Textarea
              id='bio'
              name='bio'
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell players about your coaching philosophy, program culture, and what you're looking for in recruits..."
              rows={4}
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
