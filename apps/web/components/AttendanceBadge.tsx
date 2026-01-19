'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Check, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AttendanceBadgeProps {
  tournamentId: number
  isAttending: boolean
  size?: 'sm' | 'lg'
  isPast?: boolean
}

export function AttendanceBadge({
  tournamentId,
  isAttending: initialIsAttending,
  size = 'sm',
  isPast = false,
}: AttendanceBadgeProps) {
  const router = useRouter()
  const [isAttending, setIsAttending] = useState(initialIsAttending)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/toggle-attendance`,
        {
          method: 'POST',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to toggle attendance')
      }

      const data = await response.json()
      setIsAttending(data.isAttending)
      router.refresh()
    } catch (error) {
      console.error('Error toggling attendance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // For past tournaments, show a non-interactive badge
  if (isPast) {
    if (!isAttending) return null
    return (
      <Button
        size={size}
        variant='green'
        disabled
        className='cursor-default'
      >
        <Check className='w-4 h-4 mr-2' />
        Attended
      </Button>
    )
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      size={size}
      variant={isAttending ? 'green' : 'secondary'}
    >
      {isAttending ? (
        <>
          <Check className='w-4 h-4 mr-2' />
          Attending
        </>
      ) : (
        <>
          <Plus className='w-4 h-4 mr-2' />
          Mark Attending
        </>
      )}
    </Button>
  )
}
