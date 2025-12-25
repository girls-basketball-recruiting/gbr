import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { Card } from '@workspace/ui/components/card'
import { Check } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { CheckoutButton } from '@/components/checkout-button'

export default async function PaymentPage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect('/sign-in')
  }

  // Check if user already has subscription
  const payload = await getPayload({ config })
  const users = await payload.find({
    collection: 'users',
    where: {
      clerkId: { equals: clerkUser.id },
    },
    limit: 1,
  })

  const user = users.docs[0]
  const role = clerkUser.publicMetadata?.role as string
  const promoCode = clerkUser.publicMetadata?.promoCode as string | undefined

  // If user already has subscription, redirect appropriately
  if (user?.stripeSubscriptionId) {
    // Check if they've completed onboarding
    if (role === 'player') {
      const players = await payload.find({
        collection: 'players',
        where: { user: { equals: user.id } },
        limit: 1,
      })
      if (players.docs[0]) {
        redirect('/') // Has profile, go to dashboard
      }
    } else if (role === 'coach') {
      const coaches = await payload.find({
        collection: 'coaches',
        where: { user: { equals: user.id } },
        limit: 1,
      })
      if (coaches.docs[0]) {
        redirect('/') // Has profile, go to dashboard
      }
    }

    // Has subscription but no profile yet, go to onboarding
    redirect(`/onboarding/${role}`)
  }

  const isPlayer = role === 'player'
  // const isCoach = role === 'coach'
  const price = isPlayer ? 39 : 99

  return (
    <div className='min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4'>
      <div className='max-w-lg w-full'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-white mb-4'>
            Choose Your Plan
          </h1>
          <p className='text-slate-400 text-lg'>
            Get started with full access to connect with {isPlayer ? 'college coaches' : 'talented players'}
          </p>
        </div>

        <Card className='bg-slate-800/50 border-slate-700 p-8'>
          <div className='text-center mb-8'>
            <h2 className='text-2xl font-bold text-white mb-2'>
              {isPlayer ? 'Player Pro' : 'Coach Pro'} - Annual Plan
            </h2>
            {promoCode === 'FIRST_YEAR_FREE' ? (
              <>
                <div className='flex items-center justify-center gap-4 mb-2'>
                  <span className='text-3xl font-bold text-slate-500 line-through'>
                    ${price}
                  </span>
                  <span className='text-5xl font-bold text-green-400'>
                    $0<span className='text-xl text-slate-400'>/year</span>
                  </span>
                </div>
                <div className='inline-block px-4 py-2 bg-green-900/30 border border-green-700 rounded-lg mb-2'>
                  <p className='text-green-300 font-semibold text-sm'>
                    🎉 First Year Free!
                  </p>
                </div>
                <p className='text-slate-400 text-sm'>
                  Then ${price}/year after your first 12 months
                </p>
              </>
            ) : (
              <>
                <div className='text-5xl font-bold text-blue-400 mb-2'>
                  ${price}<span className='text-xl text-slate-400'>/year</span>
                </div>
                <p className='text-slate-400'>One-time annual payment</p>
              </>
            )}
          </div>

          <div className='space-y-4 mb-8'>
            <div className='flex items-start gap-3'>
              <Check className='w-5 h-5 text-green-400 mt-0.5 shrink-0' />
              <p className='text-slate-300'>
                {isPlayer
                  ? 'Create and manage your player profile with stats, highlights, and achievements'
                  : 'Search and filter thousands of player profiles'}
              </p>
            </div>
            <div className='flex items-start gap-3'>
              <Check className='w-5 h-5 text-green-400 mt-0.5 shrink-0' />
              <p className='text-slate-300'>
                {isPlayer
                  ? 'Get discovered by college coaches actively recruiting'
                  : 'Save players to your recruiting list and track prospects'}
              </p>
            </div>
            <div className='flex items-start gap-3'>
              <Check className='w-5 h-5 text-green-400 mt-0.5 shrink-0' />
              <p className='text-slate-300'>
                {isPlayer
                  ? 'Direct messaging with college coaches'
                  : 'Add private notes and organize your recruiting pipeline'}
              </p>
            </div>
            <div className='flex items-start gap-3'>
              <Check className='w-5 h-5 text-green-400 mt-0.5 shrink-0' />
              <p className='text-slate-300'>
                {isPlayer
                  ? 'Tournament and showcase visibility'
                  : 'Access to player contact information and stats'}
              </p>
            </div>
            <div className='flex items-start gap-3'>
              <Check className='w-5 h-5 text-green-400 mt-0.5 shrink-0' />
              <p className='text-slate-300'>Priority support and regular platform updates</p>
            </div>
          </div>

          <CheckoutButton />

          <p className='text-center text-slate-500 text-sm mt-4'>
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </Card>
      </div>
    </div>
  )
}
