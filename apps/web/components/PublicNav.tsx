'use client'

import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'
import { ThemeToggle } from './ThemeToggle'

interface PublicNavProps {
  activePage?: 'players' | 'programs' | 'tournaments'
}

export function PublicNav({ activePage }: PublicNavProps) {
  return (
    <header className='sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          <Link href='/' className='font-bold text-xl text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-500 transition-colors'>
            GBR
          </Link>
          <nav className='hidden md:flex items-center gap-8'>
            <Link
              href='/players'
              className={cn(
                'text-sm font-medium transition-colors',
                activePage === 'players'
                  ? 'text-orange-600 dark:text-orange-500'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              Players
            </Link>
            <Link
              href='/programs'
              className={cn(
                'text-sm font-medium transition-colors',
                activePage === 'programs'
                  ? 'text-orange-600 dark:text-orange-500'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              Programs
            </Link>
            <Link
              href='/tournaments'
              className={cn(
                'text-sm font-medium transition-colors',
                activePage === 'tournaments'
                  ? 'text-orange-600 dark:text-orange-500'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              Tournaments
            </Link>
          </nav>
          <div className='flex items-center gap-2'>
            <ThemeToggle />
            <Link href='/sign-in'>
              <Button variant='secondary' size='sm'>
                Sign In
              </Button>
            </Link>
            <Link href='/register-player' className='hidden sm:block'>
              <Button size='sm'>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
