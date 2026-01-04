'use client'

import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

interface AuthPageLayoutProps {
  children?: React.ReactNode
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className='min-h-svh flex flex-col'>
      {/* Header with Logo and Theme Toggle */}
      <header className='w-full border-b-2 bg-accent'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo - Links to Homepage */}
            <Link
              href='/'
              className='flex items-center gap-3 group transition-all hover:opacity-80 cursor-pointer'
            >
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
      <div className='flex-1 flex items-start justify-center px-4 py-8'>
        <div className='w-full'>
          {children}
        </div>
      </div>
    </div>
  )
}
