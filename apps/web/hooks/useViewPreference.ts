'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type ViewMode = 'grid' | 'table'

const STORAGE_KEYS = {
  players: 'gbr-players-view',
  programs: 'gbr-programs-view',
} as const

type StorageKey = keyof typeof STORAGE_KEYS

export function useViewPreference(
  storageKey: StorageKey,
  defaultView: ViewMode = 'grid',
) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize view from localStorage or URL params
  const [view, setView] = useState<ViewMode>(() => {
    // Check URL params first (for shared links)
    const urlView = searchParams.get('view') as ViewMode | null
    if (urlView === 'grid' || urlView === 'table') {
      return urlView
    }

    // Then check localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS[storageKey])
      if (stored === 'grid' || stored === 'table') {
        return stored
      }
    }

    return defaultView
  })

  // Update localStorage and URL when view changes
  const handleViewChange = (newView: ViewMode) => {
    setView(newView)

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS[storageKey], newView)
    }

    // Update URL params
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', newView)
    const path = storageKey === 'players' ? '/players' : '/programs'
    router.push(`${path}?${params.toString()}`)
  }

  // Sync with localStorage on mount (hydration)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS[storageKey])
      const urlView = searchParams.get('view') as ViewMode | null

      // URL params take precedence (for shared links)
      if (urlView === 'grid' || urlView === 'table') {
        setView(urlView)
        // Update localStorage to match URL
        localStorage.setItem(STORAGE_KEYS[storageKey], urlView)
      } else if (stored === 'grid' || stored === 'table') {
        setView(stored)
      }
    }
  }, [storageKey, searchParams])

  return { view, handleViewChange }
}
