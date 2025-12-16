'use client'

import * as React from 'react'
import type { College } from '@/payload-types'

interface CollegesContextValue {
  colleges: College[]
  isLoading: boolean
  error: string | null
  fetchColleges: () => Promise<void>
}

const CollegesContext = React.createContext<CollegesContextValue | undefined>(
  undefined,
)

export function CollegesProvider({ children }: { children: React.ReactNode }) {
  const [colleges, setColleges] = React.useState<College[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const hasFetched = React.useRef(false)

  const fetchColleges = React.useCallback(async () => {
    // Only fetch once per session
    if (hasFetched.current) return

    try {
      setIsLoading(true)
      hasFetched.current = true

      // Fetch all colleges from Payload CMS
      const response = await fetch('/api/colleges/search?limit=10000')

      if (!response.ok) {
        throw new Error('Failed to fetch colleges')
      }

      const data = await response.json()
      setColleges(data.colleges || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch colleges')
      console.error('Error fetching colleges:', err)
      hasFetched.current = false // Allow retry on error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = React.useMemo(
    () => ({ colleges, isLoading, error, fetchColleges }),
    [colleges, isLoading, error, fetchColleges],
  )

  return (
    <CollegesContext.Provider value={value}>
      {children}
    </CollegesContext.Provider>
  )
}

export function useColleges() {
  const context = React.useContext(CollegesContext)
  if (context === undefined) {
    throw new Error('useColleges must be used within a CollegesProvider')
  }
  return context
}
