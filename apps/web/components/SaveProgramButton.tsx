'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Toggle } from '@workspace/ui/components/toggle'
import { Bookmark } from 'lucide-react'
import { saveProgram, unsaveProgram } from '@/actions/player-program-actions'
import { LoadingSpinner } from './LoadingSpinner'

interface SaveProgramButtonProps {
  collegeId: number
  collegeName: string
  initialIsSaved?: boolean
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function SaveProgramButton({
  collegeId,
  collegeName,
  initialIsSaved = false,
  variant = 'outline',
  size = 'default',
  className,
}: SaveProgramButtonProps) {
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Sync state when prop changes (e.g., after page refresh)
  useEffect(() => {
    setIsSaved(initialIsSaved)
  }, [initialIsSaved])

  const handleToggleSave = async (pressed: boolean) => {
    // Optimistic update
    const previousState = isSaved
    setIsSaved(pressed)
    setIsLoading(true)

    try {
      if (pressed) {
        // Save the program
        await saveProgram(collegeId)
      } else {
        // Unsave the program
        await unsaveProgram(collegeId)
      }

      // Refresh the page data to ensure consistency
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('Error toggling save:', error)
      // Revert the state on error
      setIsSaved(previousState)

      // Refresh to get accurate state from server
      startTransition(() => {
        router.refresh()
      })
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
      aria-label={isSaved ? `Unsave ${collegeName}` : `Save ${collegeName}`}
    >
      <Bookmark className={isSaved ? 'text-primary fill-primary' : ''} />
      {size !== 'sm' && (
        <span className='ml-2'>{isLoading || isPending ? <LoadingSpinner /> : isSaved ? 'Saved' : 'Save'}</span>
      )}
    </Toggle>
  )
}
