'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { hash } from 'ohash'
import type { College } from '@/payload-types'

interface CollegesContextValue {
  colleges: College[]
  isLoading: boolean
  error: Error | null
  searchColleges: (query: string) => College[]
}

const CollegesContext = React.createContext<CollegesContextValue | undefined>(
  undefined,
)

async function fetchColleges(): Promise<College[]> {
  const response = await fetch('/api/colleges/search?limit=10000')

  if (!response.ok) {
    throw new Error('Failed to fetch colleges')
  }

  const data = await response.json()
  return data.colleges || []
}

export function CollegesProvider({ children }: { children: React.ReactNode }) {
  // Fetch colleges with React Query
  const { data: colleges = [], isLoading, error } = useQuery({
    queryKey: ['colleges'],
    queryFn: fetchColleges,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Memoize the colleges hash for deep equality comparison
  const collegesHash = React.useMemo(() => hash(colleges), [colleges])

  // Memoized search function with ohash for deep equality
  // Using collegesHash for deep equality - only recreate when content changes
  const searchColleges = React.useCallback(
    (query: string): College[] => {
      if (!query || !colleges.length) return colleges

      const lower = query.toLowerCase()
      return colleges.filter(
        c =>
          c.school.toLowerCase().includes(lower) ||
          c.city?.toLowerCase().includes(lower) ||
          c.state?.toLowerCase().includes(lower)
      )
    },
    // Using collegesHash for deep equality check
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collegesHash, colleges]
  )

  // Using collegesHash for deep equality - only recreate when content changes
  const value = React.useMemo(
    () => ({
      colleges,
      isLoading,
      error: error as Error | null,
      searchColleges,
    }),
    // Using collegesHash for deep equality check
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collegesHash, colleges, isLoading, error, searchColleges]
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
