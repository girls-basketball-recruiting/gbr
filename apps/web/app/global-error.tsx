'use client'

import { useEffect } from 'react'
import { redirect } from 'next/navigation'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {

  useEffect(() => {
    // Log the error to console for debugging
    console.error('Global application error:', error)
  }, [error])

  const handleSignOut = async () => {
    await redirect('/sign-out')
  }

  return (
    <html lang='en'>
      <body className='bg-slate-900'>
        <div className='flex min-h-screen items-center justify-center px-4'>
          <div className='max-w-md w-full space-y-8 text-center'>
            <div className='space-y-4'>
              <h1 className='text-4xl font-bold text-white'>
                Something went wrong
              </h1>
              <p className='text-lg text-slate-400'>
                We encountered an unexpected error. Please try again.
              </p>
              {error.digest && (
                <p className='text-sm text-slate-500 font-mono'>
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button
                onClick={reset}
                className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors'
              >
                Try again
              </button>
              <a
                href='/'
                className='px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors'
              >
                Go home
              </a>
            </div>
            <div className='mt-6'>
              <button
                onClick={handleSignOut}
                className='text-sm text-slate-400 hover:text-white underline transition-colors'
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
