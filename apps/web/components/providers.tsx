'use client'

import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { CollegesProvider } from '@/contexts/colleges-provider'
import { Toaster } from '@workspace/ui/components/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance
  // Use React.useState to ensure it's only created once per client session
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default stale time: 5 minutes
            staleTime: 1000 * 60 * 5,
            // Default cache time: 30 minutes
            gcTime: 1000 * 60 * 30,
            // Retry failed requests
            retry: 1,
            // Refetch on window focus for fresh data
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute='class'
        defaultTheme='system'
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        <CollegesProvider>
          {children}
          <Toaster />
        </CollegesProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  )
}
