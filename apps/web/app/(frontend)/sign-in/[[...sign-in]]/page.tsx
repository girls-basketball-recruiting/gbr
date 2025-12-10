'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className='min-h-svh flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-white mb-2'>Welcome Back</h1>
          <p className='text-slate-400'>Sign in to your account</p>
        </div>

        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-slate-800 border-slate-700',
            },
          }}
          afterSignInUrl='/'
          redirectUrl='/'
        />
      </div>
    </div>
  )
}
