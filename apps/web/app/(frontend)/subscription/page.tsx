import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Check, CreditCard, Calendar, AlertCircle } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PortalButton } from '@/components/portal-button'
import Link from 'next/link'

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
    <div className='max-w-lg p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-slate-900 dark:text-white mb-2'>
            Subscription
          </h1>
          <p className='text-slate-600 dark:text-slate-400'>
            Manage your subscription and billing details
          </p>
        </div>

        {hasActiveSubscription ? (
          <div className='space-y-6'>
            {/* Current Plan */}
            <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6'>
              <div className='flex items-start justify-between mb-2'>
                <div>
                  <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
                    {isPlayer ? 'Player Pro' : 'Coach Pro'}
                  </h2>
                  <p className='text-slate-600 dark:text-slate-400'>Annual Plan</p>
                </div>
                <div className='flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-600/20 border border-green-200 dark:border-green-500/50 rounded-lg'>
                  <Check className='w-4 h-4 text-green-600 dark:text-green-400' />
                  <span className='text-sm font-medium text-green-600 dark:text-green-400'>
                    Active
                  </span>
                </div>
              </div>

              <div className='space-y-4 mb-2'>
                <div className='flex items-start gap-3'>
                  <CreditCard className='w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5' />
                  <div>
                    <p className='text-sm font-medium text-slate-600 dark:text-slate-400'>
                      Billing Amount
                    </p>
                    <p className='text-lg font-semibold text-slate-900 dark:text-white'>
                      ${price}.00 / year
                    </p>
                  </div>
                </div>

                {subscriptionEndDate && (
                  <div className='flex items-start gap-3'>
                    <Calendar className='w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5' />
                    <div>
                      <p className='text-sm font-medium text-slate-600 dark:text-slate-400'>
                        Next Billing Date
                      </p>
                      <p className='text-lg font-semibold text-slate-900 dark:text-white'>
                        {subscriptionEndDate}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className='space-y-3'>
                <div className='flex items-start gap-3'>
                  <Check className='w-5 h-5 text-green-500 mt-0.5 shrink-0' />
                  <p className='text-slate-700 dark:text-slate-300'>
                    {isPlayer
                      ? 'Complete player profile with stats and highlights'
                      : 'Unlimited player profile searches'}
                  </p>
                </div>
                <div className='flex items-start gap-3'>
                  <Check className='w-5 h-5 text-green-500 mt-0.5 shrink-0' />
                  <p className='text-slate-700 dark:text-slate-300'>
                    {isPlayer
                      ? 'Get discovered by college programs'
                      : 'Save and track unlimited prospects'}
                  </p>
                </div>
                <div className='flex items-start gap-3'>
                  <Check className='w-5 h-5 text-green-500 mt-0.5 shrink-0' />
                  <p className='text-slate-700 dark:text-slate-300'>
                    {isPlayer
                      ? 'Save college programs of interest'
                      : 'Private notes and recruiting pipeline'}
                  </p>
                </div>
                <div className='flex items-start gap-3'>
                  <Check className='w-5 h-5 text-green-500 mt-0.5 shrink-0' />
                  <p className='text-slate-700 dark:text-slate-300'>
                    Priority support and platform updates
                  </p>
                </div>
              </div>

              <div className='mt-2 pt-6 border-t border-slate-200 dark:border-slate-700'>
                <PortalButton />
                <p className='text-center text-slate-500 dark:text-slate-400 text-sm mt-3'>
                  Update payment method, view invoices, or cancel subscription
                </p>
              </div>
            </Card>
          </div>
        ) : (
          // No active subscription
          <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6'>
            <div className='flex items-start gap-4 mb-6'>
              <div className='p-3 bg-orange-50 dark:bg-orange-600/20 rounded-lg'>
                <AlertCircle className='w-6 h-6 text-orange-600 dark:text-orange-400' />
              </div>
              <div>
                <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-2'>
                  No Active Subscription
                </h2>
                <p className='text-slate-600 dark:text-slate-400'>
                  You don&apos;t have an active subscription yet. Subscribe to unlock full
                  access to the platform.
                </p>
              </div>
            </div>

            <Button
              className='w-full bg-blue-600 hover:bg-blue-700 text-white'
              asChild
            >
              <Link href='/payment'>Subscribe Now</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
