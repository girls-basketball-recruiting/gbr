'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'

interface SavePlayerButtonProps {
  playerId: number
  initialIsSaved?: boolean
  variant?: 'default' | 'outline'
  className?: string
}

export function SavePlayerButton({
  playerId,
  initialIsSaved = false,
  variant = 'outline',
  className,
}: SavePlayerButtonProps) {
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleToggleSave = async () => {
    setIsLoading(true)

    try {
      if (isSaved) {
        // Unsave the player
        const response = await fetch(`/api/saved-players/${playerId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to unsave player')
        }

        setIsSaved(false)
      } else {
        // Save the player
        const response = await fetch('/api/saved-players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId }),
        })

        if (!response.ok) {
          const data = await response.json()
          // If already saved (409), just update the state
          if (response.status === 409) {
            setIsSaved(true)
          } else {
            throw new Error(data.error || 'Failed to save player')
          }
        } else {
          setIsSaved(true)
        }
      }

      // Refresh the page data
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('Error toggling save:', error)
      // Revert the state on error
      setIsSaved(!isSaved)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleToggleSave}
      disabled={isLoading || isPending}
      className={className}
    >
      {isLoading || isPending ? (
        'Loading...'
      ) : isSaved ? (
        <>
          <svg
            className='w-4 h-4 mr-2 fill-current'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z' />
          </svg>
          Saved
        </>
      ) : (
        <>
          <svg
            className='w-4 h-4 mr-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z'
            />
          </svg>
          Save Player
        </>
      )}
    </Button>
  )
}
