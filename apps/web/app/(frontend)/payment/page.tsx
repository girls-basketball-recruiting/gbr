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
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-slate-900 mb-3'>
            Complete Your Subscription
          </h1>
          <p className='text-slate-600 text-lg'>
            {isPlayer ? 'Player Pro' : 'Coach Pro'} - Annual Plan
          </p>
          {promoCode === 'FIRST_YEAR_FREE' ? (
            <div className='mt-4'>
              <div className='flex items-center justify-center gap-4 mb-2'>
                <span className='text-2xl font-bold text-slate-400 line-through'>
                  ${price}/year
                </span>
                <span className='text-4xl font-bold text-emerald-600'>
                  Free for 1 year
                </span>
              </div>
              <div className='inline-block px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg'>
                <p className='text-emerald-700 font-semibold text-sm'>
                  🎉 First Year Free Promotion Applied
                </p>
              </div>
              <p className='text-slate-500 text-sm mt-2'>
                Then ${price}/year after your first 12 months
              </p>
            </div>
          ) : (
            <div className='mt-4'>
              <div className='text-4xl font-bold text-slate-900'>
                ${price}<span className='text-xl text-slate-500 font-normal'>/year</span>
              </div>
              <p className='text-slate-500 text-sm mt-1'>Billed annually</p>
            </div>
          )}
        </div>

        <div className='grid lg:grid-cols-3 gap-8 mb-12'>
          <div className='lg:col-span-2 order-2 lg:order-1'>
            <CheckoutButton />
          </div>

          <div className='order-1 lg:order-2'>
            <Card className='bg-slate-50 border-slate-200 p-6'>
              <h3 className='font-semibold text-slate-900 mb-4'>What&apos;s included</h3>
              <div className='space-y-3'>
                <div className='flex items-start gap-2'>
                  <Check className='w-5 h-5 text-emerald-600 mt-0.5 shrink-0' />
                  <p className='text-slate-700 text-sm'>
                    {isPlayer
                      ? 'Create and manage your player profile'
                      : 'Search thousands of player profiles'}
                  </p>
                </div>
                <div className='flex items-start gap-2'>
                  <Check className='w-5 h-5 text-emerald-600 mt-0.5 shrink-0' />
                  <p className='text-slate-700 text-sm'>
                    {isPlayer
                      ? 'Get discovered by college programs'
                      : 'Save players to your recruiting list'}
                  </p>
                </div>
                <div className='flex items-start gap-2'>
                  <Check className='w-5 h-5 text-emerald-600 mt-0.5 shrink-0' />
                  <p className='text-slate-700 text-sm'>
                    {isPlayer
                      ? 'Tournament visibility'
                      : 'Full prospect management'}
                  </p>
                </div>
                <div className='flex items-start gap-2'>
                  <Check className='w-5 h-5 text-emerald-600 mt-0.5 shrink-0' />
                  <p className='text-slate-700 text-sm'>Priority support</p>
                </div>
              </div>

              <div className='mt-6 pt-6 border-t border-slate-200'>
                <p className='text-slate-500 text-xs text-center'>
                  Secure payment powered by Stripe
                  <br />
                  Cancel anytime
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
