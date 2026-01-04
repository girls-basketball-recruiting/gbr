import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { Card } from '@workspace/ui/components/card'
import { Check } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { CheckoutButton } from '@/components/checkout-button'
import { H1 } from '@/components/ui/typography/H1'
import { H3 } from '@/components/ui/typography/H3'
import { P } from '@/components/ui/typography/P'
import { MutedText } from '@/components/ui/typography/MutedText'
import { Small } from '@/components/ui/typography/Small'

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
  // Check publicMetadata first (after webhook processes), then unsafeMetadata (during race condition)
  const role = (clerkUser.publicMetadata?.role || clerkUser.unsafeMetadata?.role) as string
  const promoCode = (clerkUser.publicMetadata?.promoCode || clerkUser.unsafeMetadata?.promoCode) as string | undefined

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
    <div className='min-h-screen'>
      <div className='max-w-2xl mx-auto px-4 py-12'>
        <div className='text-center mb-12'>
          <H1>Complete Your Subscription</H1>
          <P>{isPlayer ? 'Player Pro' : 'Coach Pro'} - Annual Plan</P>
          {promoCode === 'FIRST_YEAR_FREE' ? (
            <div className='mt-4'>
              <div className='flex items-center justify-center gap-4 mb-2'>
                <span className='text-2xl font-bold line-through'>
                  ${price}/year
                </span>
                <span className='text-4xl font-bold'>
                  Free for 1 year
                </span>
              </div>
              <div className='inline-block px-4 py-2 border rounded-lg'>
                <p className='font-semibold text-sm'>
                  First Year Free Promotion Applied
                </p>
              </div>
              <MutedText className='text-sm mt-2'>
                Then ${price}/year after your first 12 months
              </MutedText>
            </div>
          ) : (
            <div className='mt-4'>
              <div className='text-4xl font-bold'>
                ${price}<span className='text-xl font-normal'>/year</span>
              </div>
              <MutedText className='text-sm mt-1'>Billed annually</MutedText>
            </div>
          )}
        </div>

        <div className='grid md:grid-cols-2 sm:grid-cols-1 gap-5'>
          <CheckoutButton />

          <div className='w-103 md:w-auto mx-auto'>
            <Card className='p-6'>
              <H3>What&apos;s included</H3>
              <div className='space-y-3'>
                <div className='flex items-start gap-2'>
                  <Check className='w-5 h-5 mt-0.5 shrink-0' />
                  <Small>
                    {isPlayer
                      ? 'Create and manage your player profile'
                      : 'Search thousands of player profiles'}
                  </Small>
                </div>
                <div className='flex items-start gap-2'>
                  <Check className='w-5 h-5 mt-0.5 shrink-0' />
                  <Small>
                    {isPlayer
                      ? 'Get discovered by college programs'
                      : 'Save players to your recruiting list'}
                  </Small>
                </div>
                <div className='flex items-start gap-2'>
                  <Check className='w-5 h-5 mt-0.5 shrink-0' />
                  <Small>
                    {isPlayer
                      ? 'Tournament visibility'
                      : 'Full prospect management'}
                  </Small>
                </div>
                <div className='flex items-start gap-2'>
                  <Check className='w-5 h-5 mt-0.5 shrink-0' />
                  <Small>Priority support</Small>
                </div>
              </div>

              <div className='pt-6 border-t'>
                <MutedText className='text-xs text-center'>
                  Secure payment powered by Stripe
                  <br />
                  Cancel anytime
                </MutedText>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
