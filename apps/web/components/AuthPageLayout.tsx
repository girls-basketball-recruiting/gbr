'use client'

import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

interface AuthPageLayoutProps {
  children?: React.ReactNode
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className='min-h-svh flex flex-col bg-linear-to-b from-orange-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'>
      {/* Header with Logo and Theme Toggle */}
      <header className='w-full border-b border-slate-200 dark:border-slate-700/50 backdrop-blur-sm bg-white/95 dark:bg-slate-900/50'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo - Links to Homepage */}
            <Link
              href='/'
              className='flex items-center gap-3 group transition-all hover:opacity-80'
            >
              <div className='flex aspect-square size-10 items-center justify-center rounded-lg bg-linear-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-all'>
                <span className='font-bold text-lg'>GB</span>
              </div>
              <div className='hidden sm:block'>
                <div className='font-semibold text-slate-900 dark:text-white text-sm'>
                  Girls Basketball Recruiting
                </div>
                <div className='text-xs text-slate-600 dark:text-slate-400'>
                  Database
                </div>
              </div>
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className='flex-1 flex items-start justify-center px-4 py-12'>
        <div className='w-full max-w-100'>
          {children}
        </div>
      </div>
    </div>
  )
}
