'use client'

import { SignUp } from '@clerk/nextjs'

export default function CoachSignUpPage() {
  return (
    <div className='min-h-svh flex items-center justify-center bg-linear-to-b from-slate-900 via-slate-800 to-slate-900'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-white mb-2'>
            Coach Registration
          </h1>
          <p className='text-slate-400'>
            Create your account to find talented recruits
          </p>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-slate-800 border-slate-700',
            },
          }}
          unsafeMetadata={{
            role: 'coach',
          }}
          forceRedirectUrl='/onboarding/coach'
        />
      </div>
    </div>
  )
}
