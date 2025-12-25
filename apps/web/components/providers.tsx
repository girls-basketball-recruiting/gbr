'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { CollegesProvider } from '@/contexts/colleges-provider'
import { Toaster } from '@workspace/ui/components/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
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
  )
}
