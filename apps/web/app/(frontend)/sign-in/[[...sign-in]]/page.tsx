'use client'

import { AuthPageLayout } from '@/components/AuthPageLayout'
import dynamic from 'next/dynamic'

const DynamicSignIn = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignIn),
  { ssr: false }
)

export default function SignInPage() {
  return (
    <AuthPageLayout>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold text-slate-900 dark:text-white mb-2'>Welcome Back</h1>
        <p className='text-slate-600 dark:text-slate-400'>Sign in to your account</p>
      </div>

      <DynamicSignIn
        appearance={{
          elements: {
            rootBox: 'w-full m-auto',
            card: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
          },
        }}
        afterSignInUrl='/'
        redirectUrl='/'
      />
    </AuthPageLayout>
  )
}
