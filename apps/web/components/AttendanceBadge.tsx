'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Check, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AttendanceBadgeProps {
  tournamentId: number
  isAttending: boolean
  size?: 'sm' | 'lg'
  variant?: 'default' | 'outline'
}

export function AttendanceBadge({
  tournamentId,
  isAttending: initialIsAttending,
  size = 'sm',
  variant = 'default',
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

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      size={size}
      variant={isAttending ? 'outline' : variant}
      className={
        isAttending
          ? 'border-green-500 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/10'
          : ''
      }
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
