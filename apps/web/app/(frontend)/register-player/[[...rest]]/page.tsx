'use client'

import { SignUp } from '@clerk/nextjs'

export default function PlayerSignUpPage() {
  return (
    <div className='min-h-svh flex items-center justify-center bg-linear-to-b from-slate-900 via-slate-800 to-slate-900'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-white mb-2'>
            Player Registration
          </h1>
          <p className='text-slate-400'>
            Create your profile to connect with college coaches
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
            role: 'player',
          }}
          forceRedirectUrl='/onboarding/player'
        />
      </div>
    </div>
  )
}
