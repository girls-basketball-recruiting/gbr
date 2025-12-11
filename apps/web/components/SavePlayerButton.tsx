'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Toggle } from '@workspace/ui/components/toggle'
import { Bookmark } from 'lucide-react'

interface SavePlayerButtonProps {
  playerId: number
  initialIsSaved?: boolean
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function SavePlayerButton({
  playerId,
  initialIsSaved = false,
  variant = 'outline',
  size = 'default',
  className,
}: SavePlayerButtonProps) {
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleToggleSave = async (pressed: boolean) => {
    setIsLoading(true)

    try {
      if (pressed) {
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
      } else {
        // Unsave the player
        const response = await fetch(`/api/saved-players/${playerId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to unsave player')
        }

        setIsSaved(false)
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
    <Toggle
      variant={variant}
      size={size}
      pressed={isSaved}
      onPressedChange={handleToggleSave}
      disabled={isLoading || isPending}
      className={className}
      aria-label={isSaved ? 'Unsave player' : 'Save player'}
    >
      <Bookmark className={isSaved ? 'fill-current' : ''} />
      {size !== 'sm' && (
        <span className='ml-2'>{isSaved ? 'Saved' : 'Save'}</span>
      )}
    </Toggle>
  )
}
