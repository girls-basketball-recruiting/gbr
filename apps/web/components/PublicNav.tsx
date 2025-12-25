'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'
import { ThemeToggle } from './ThemeToggle'
import { Menu, X } from 'lucide-react'

interface PublicNavProps {
  activePage?: 'players' | 'programs' | 'tournaments' | 'home'
}

export function PublicNav({ activePage }: PublicNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home', page: 'home' },
    { href: '/players', label: 'Players', page: 'players' },
    { href: '/programs', label: 'Programs', page: 'programs' },
    { href: '/tournaments', label: 'Tournaments', page: 'tournaments' },
  ]

  return (
    <header className='sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          <Link
            href='/'
            className='font-bold text-xl text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-500 transition-colors'
            onClick={() => setMobileMenuOpen(false)}
          >
            GBR
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center gap-8'>
            {navLinks.map((link) => (
              <Link
                key={link.page}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  activePage === link.page
                    ? 'text-orange-600 dark:text-orange-500'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className='hidden md:flex items-center gap-2'>
            <ThemeToggle />
            <Link href='/sign-in'>
              <Button variant='secondary' size='sm'>
                Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className='flex md:hidden items-center gap-2'>
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors'
              aria-label='Toggle menu'
            >
              {mobileMenuOpen ? (
                <X className='w-6 h-6' />
              ) : (
                <Menu className='w-6 h-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className='md:hidden border-t border-slate-200 dark:border-slate-800 py-4 animate-in slide-in-from-top duration-200'>
            <nav className='flex flex-col space-y-4'>
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'text-base font-medium transition-colors px-4 py-2 rounded-lg',
                    activePage === link.page
                      ? 'text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className='pt-4 px-4 border-t border-slate-200 dark:border-slate-800'>
                <Link href='/sign-in' onClick={() => setMobileMenuOpen(false)}>
                  <Button variant='secondary' size='sm' className='w-full'>
                    Sign In
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
