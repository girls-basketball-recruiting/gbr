'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Toggle } from '@workspace/ui/components/toggle'
import { Bookmark } from 'lucide-react'
import { saveProgram, unsaveProgram } from '@/actions/player-program-actions'

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

      // Refresh the page data
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('Error toggling save:', error)
      // Revert the state on error
      setIsSaved(previousState)

      // Show error message to user
      const action = pressed ? 'save' : 'unsave'
      const errorMessage = error instanceof Error ? error.message : `Failed to ${action} ${collegeName}`
      alert(errorMessage)
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
      className={`${className} ${
        isSaved
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
      }`}
      aria-label={isSaved ? `Unsave ${collegeName}` : `Save ${collegeName}`}
    >
      <Bookmark className={isSaved ? 'fill-current' : ''} />
      {size !== 'sm' && (
        <span className='ml-2'>{isSaved ? 'Saved' : 'Save'}</span>
      )}
    </Toggle>
  )
}
