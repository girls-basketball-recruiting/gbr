'use client'

import { AuthPageLayout } from '@/components/AuthPageLayout'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { validateInvitation, type Invitation } from '@/actions/invitation-actions'
import Link from 'next/link'
import { H1, P } from '@/components/ui/typography'

const DynamicSignUp = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignUp),
  { ssr: false }
)

export default function RegisterPage({ role }: { role: 'Player' | 'Coach' }) {
  const searchParams = useSearchParams()
  const inviteToken = searchParams?.get('invite')
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!inviteToken)

  const registerHref= role === 'Player' ? '/register-player' : '/register-coach'

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
        <div className='text-center max-w-100 mx-auto'>
          <H1 className='mb-6'>
            Invalid Invitation
          </H1>
          <P>{error}</P>
          <Link
            href={registerHref}
            className='hover:underline cursor-pointer'
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
        <H1 className='md:text-5xl mb-6'>
          {role} Registration
        </H1>
        <P>
          {role === 'Player' ? 'Create your profile to connect with college programs' : 'Create your account to find talented recruits'}
        </P>
        {invitation?.promoCode && (
          <div className='mt-4 inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg'>
            <p className='text-green-800 dark:text-green-300 font-semibold text-sm'>
              🎉 First Year Free Promotion Active!
            </p>
          </div>
        )}
      </div>

      <div className='max-w-100 mx-auto'>
        <DynamicSignUp
          unsafeMetadata={{
            role: role.toLowerCase(),
            invitationToken: inviteToken || undefined,
            promoCode: invitation?.promoCode || undefined,
          }}
          forceRedirectUrl='/payment'
        />
      </div>
    </AuthPageLayout>
  )
}
