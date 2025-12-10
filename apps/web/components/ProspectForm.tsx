'use client'

import { useState, useEffect } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { useRouter } from 'next/navigation'

interface ProspectFormProps {
  coachId?: string | number
}

export function ProspectForm({ coachId }: ProspectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [tournaments, setTournaments] = useState<any[]>([])
  const [selectedTournaments, setSelectedTournaments] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    uniformNumber: '',
    graduationYear: new Date().getFullYear() + 1,
    height: '',
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
    <Card className='bg-slate-800/50 border-slate-700 p-8 max-w-md mx-auto'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Name */}
        <div>
          <label className='block text-sm font-medium text-slate-300 mb-2'>
            Full Name <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className='w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
          />
        </div>

        {/* Uniform Number and Graduation Year */}
        <div className='grid md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-slate-300 mb-2'>
              Uniform Number
            </label>
            <input
              type='text'
              value={formData.uniformNumber}
              onChange={(e) =>
                setFormData({ ...formData, uniformNumber: e.target.value })
              }
              className='w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-300 mb-2'>
              Graduation Year <span className='text-red-500'>*</span>
            </label>
            <input
              type='number'
              required
              value={formData.graduationYear}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  graduationYear: parseInt(e.target.value),
                })
              }
              className='w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
            />
          </div>
        </div>

        {/* Height */}
        <div>
          <label className='block text-sm font-medium text-slate-300 mb-2'>
            Height
          </label>
          <input
            type='text'
            placeholder="e.g., 5'10&rdquo;"
            value={formData.height}
            onChange={(e) =>
              setFormData({ ...formData, height: e.target.value })
            }
            className='w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
          />
        </div>

        {/* High School and AAU Program */}
        <div className='grid md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-slate-300 mb-2'>
              High School
            </label>
            <input
              type='text'
              value={formData.highSchool}
              onChange={(e) =>
                setFormData({ ...formData, highSchool: e.target.value })
              }
              className='w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-300 mb-2'>
              AAU Program
            </label>
            <input
              type='text'
              value={formData.aauProgram}
              onChange={(e) =>
                setFormData({ ...formData, aauProgram: e.target.value })
              }
              className='w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
            />
          </div>
        </div>

        {/* Twitter and Phone */}
        <div className='grid md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-slate-300 mb-2'>
              Twitter/X Handle
            </label>
            <input
              type='text'
              placeholder='@username'
              value={formData.twitterHandle}
              onChange={(e) =>
                setFormData({ ...formData, twitterHandle: e.target.value })
              }
              className='w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-300 mb-2'>
              Phone Number
            </label>
            <input
              type='tel'
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className='w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
            />
          </div>
        </div>

        {/* Tournament Schedule */}
        {tournaments.length > 0 && (
          <div>
            <label className='block text-sm font-medium text-slate-300 mb-2'>
              Tournament Schedule
            </label>
            <div className='space-y-2 max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded-md p-3'>
              {tournaments.map((tournament) => (
                <label
                  key={tournament.id}
                  className='flex items-center space-x-2 text-slate-300 hover:bg-slate-800 p-2 rounded cursor-pointer'
                >
                  <input
                    type='checkbox'
                    checked={selectedTournaments.includes(tournament.id)}
                    onChange={() => handleTournamentToggle(tournament.id)}
                    className='rounded border-slate-600 text-purple-600 focus:ring-purple-500'
                  />
                  <span className='text-sm'>
                    {tournament.name} - {tournament.location}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className='block text-sm font-medium text-slate-300 mb-2'>
            Private Notes
          </label>
          <textarea
            rows={4}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder='Add any private notes about this prospect...'
            className='w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
          />
        </div>

        {/* Submit Buttons */}
        <div className='flex gap-3 pt-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.back()}
            className='flex-1 border-slate-600 text-white hover:bg-slate-800'
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
      </form>
    </Card>
  )
}
