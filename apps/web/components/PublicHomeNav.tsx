'use client'

import { useState, useEffect } from 'react'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'
import { ThemeToggle } from './ThemeToggle'
import { Menu, X } from 'lucide-react'

export function PublicHomeNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'players', 'programs', 'tournaments', 'pricing']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  const navSections = [
    { id: 'home', label: 'Home' },
    { id: 'players', label: 'Players' },
    { id: 'programs', label: 'Programs' },
    { id: 'tournaments', label: 'Tournaments' },
    { id: 'pricing', label: 'Pricing' },
  ]

  return (
    <header className='sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          <button
            onClick={() => scrollToSection('home')}
            className='font-bold text-xl text-slate-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-500 transition-colors'
          >
            GBR
          </button>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center gap-8'>
            {navSections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  'text-sm font-medium transition-colors',
                  activeSection === section.id
                    ? 'text-orange-600 dark:text-orange-500'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                )}
              >
                {section.label}
              </button>
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
              {navSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    'text-base font-medium transition-colors px-4 py-2 rounded-lg text-left',
                    activeSection === section.id
                      ? 'text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  )}
                >
                  {section.label}
                </button>
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
