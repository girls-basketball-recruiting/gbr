import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { Card } from '@workspace/ui/components/card'
import { Check, CreditCard, Calendar, AlertCircle } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PortalButton } from '@/components/portal-button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { H1 } from '@/components/ui/typography/H1'
import { H2 } from '@/components/ui/typography/H2'
import { P } from '@/components/ui/typography/P'
import { MutedText } from '@/components/ui/typography/MutedText'
import { Small } from '@/components/ui/typography/Small'

export default async function SubscriptionPage() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect('/sign-in')
  }

  // Get user from database
  const payload = await getPayload({ config })
  const users = await payload.find({
    collection: 'users',
    where: {
      clerkId: { equals: clerkUser.id },
    },
    limit: 1,
  })

  const user = users.docs[0]

  if (!user) {
    redirect('/')
  }

  const hasActiveSubscription = !!user.stripeSubscriptionId
  const role = clerkUser.publicMetadata?.role as string
  const isPlayer = role === 'player'
  const price = isPlayer ? 39 : 99

  // Format subscription end date
  const subscriptionEndDate = user.stripeCurrentPeriodEnd
    ? new Date(user.stripeCurrentPeriodEnd).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className='max-w-lg px-10 mx-auto'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8 text-center'>
          <H1>Subscription</H1>
          <P className='mt-6 text-lg'>Manage your subscription and billing details</P>
        </div>

        {hasActiveSubscription ? (
          <div className='space-y-6'>
            {/* Current Plan */}
            <Card className='p-6'>
              <div className='flex items-start justify-between mb-2'>
                <div>
                  <H2>{isPlayer ? 'Player Pro' : 'Coach Pro'}</H2>
                  <P>Annual Plan</P>
                </div>
                <div className='flex items-center gap-2 px-3 py-2 border rounded-lg'>
                  <Check className='w-4 h-4' />
                  <span className='text-sm font-medium'>Active</span>
                </div>
              </div>

              <div className='space-y-4 mb-2'>
                <div className='flex items-start gap-3'>
                  <CreditCard className='w-5 h-5 mt-0.5' />
                  <div>
                    <Small>Billing Amount</Small>
                    <p className='text-lg font-semibold'>${price}.00 / year</p>
                  </div>
                </div>

                {subscriptionEndDate && (
                  <div className='flex items-start gap-3'>
                    <Calendar className='w-5 h-5 mt-0.5' />
                    <div>
                      <Small>Next Billing Date</Small>
                      <p className='text-lg font-semibold'>{subscriptionEndDate}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className='space-y-3'>
                <div className='flex items-start gap-3'>
                  <Check className='w-5 h-5 mt-0.5 shrink-0' />
                  <P>
                    {isPlayer
                      ? 'Complete player profile with stats and highlights'
                      : 'Unlimited player profile searches'}
                  </P>
                </div>
                <div className='flex items-start gap-3'>
                  <Check className='w-5 h-5 mt-0.5 shrink-0' />
                  <P>
                    {isPlayer
                      ? 'Get discovered by college programs'
                      : 'Save and track unlimited prospects'}
                  </P>
                </div>
                <div className='flex items-start gap-3'>
                  <Check className='w-5 h-5 mt-0.5 shrink-0' />
                  <P>
                    {isPlayer
                      ? 'Save college programs of interest'
                      : 'Private notes and recruiting pipeline'}
                  </P>
                </div>
                <div className='flex items-start gap-3'>
                  <Check className='w-5 h-5 mt-0.5 shrink-0' />
                  <P>Priority support and platform updates</P>
                </div>
              </div>

              <div className='mt-2 pt-6 border-t'>
                <PortalButton />
                <MutedText className='text-center text-sm mt-3'>
                  Update payment method, view invoices, or cancel subscription
                </MutedText>
              </div>
            </Card>
          </div>
        ) : (
          // No active subscription
          <Card className='p-6'>
            <div className='flex items-start gap-4 mb-6'>
              <div className='p-3 rounded-lg'>
                <AlertCircle className='w-6 h-6' />
              </div>
              <div>
                <H2>No Active Subscription</H2>
                <P>
                  You don&apos;t have an active subscription yet. Subscribe to unlock full
                  access to the platform.
                </P>
              </div>
            </div>

            <ButtonLink href='/payment' className='w-full'>
              Subscribe Now
            </ButtonLink>
          </Card>
        )}
      </div>
    </div>
  )
}
