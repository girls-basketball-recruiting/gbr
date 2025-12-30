'use client'

import { AuthPageLayout } from '@/components/AuthPageLayout'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { validateInvitation, type Invitation } from '@/actions/invitation-actions'
import Link from 'next/link'

const DynamicSignUp = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignUp),
  { ssr: false }
)

export default function PlayerSignUpPage() {
  const searchParams = useSearchParams()
  const inviteToken = searchParams?.get('invite')
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!inviteToken)

  useEffect(() => {
    if (inviteToken) {
      validateInvitation(inviteToken)
        .then(setInvitation)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [inviteToken])

  if (loading) {
    return <AuthPageLayout />
  }

  if (error) {
    return (
      <AuthPageLayout>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-red-600 dark:text-red-500 mb-2'>
            Invalid Invitation
          </h1>
          <p className='text-slate-600 dark:text-slate-400 mb-6'>{error}</p>
          <Link
            href='/register-player'
            className='text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
          >
            Register without invitation
          </Link>
        </div>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold text-slate-900 dark:text-white mb-2'>
          Player Registration
        </h1>
        <p className='text-slate-600 dark:text-slate-400'>
          Create your profile to connect with college coaches
        </p>
        {invitation?.promoCode && (
          <div className='mt-4 inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg'>
            <p className='text-green-800 dark:text-green-300 font-semibold text-sm'>
              🎉 First Year Free Promotion Active!
            </p>
          </div>
        )}
      </div>

      <DynamicSignUp
        unsafeMetadata={{
          role: 'player',
          invitationToken: inviteToken || undefined,
          promoCode: invitation?.promoCode || undefined,
        }}
        forceRedirectUrl='/payment'
      />
    </AuthPageLayout>
  )
}
