'use client'

import { AuthPageLayout } from '@/components/AuthPageLayout'
import { H1, P } from '@/components/ui/typography'
import dynamic from 'next/dynamic'

const DynamicSignIn = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignIn),
  { ssr: false }
)

export default function SignInPage() {
  return (
    <AuthPageLayout>
      <div className='text-center mb-8'>
        <H1 className='mb-6'>Welcome Back</H1>
        <P>Sign in to your account</P>
      </div>

      <DynamicSignIn
        appearance={{
          elements: {
            rootBox: 'w-full m-auto',
          },
        }}
      />
    </AuthPageLayout>
  )
}
