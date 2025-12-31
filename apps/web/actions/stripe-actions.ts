'use server'

import { currentUser } from '@clerk/nextjs/server'
import { stripe, getOrCreateStripeCustomer, STRIPE_PRICES } from '@/lib/stripe'

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  'http://localhost:3000'

export async function createCheckoutSession() {
  const user = await currentUser()

  if (!user) {
    throw new Error('You must be signed in to upgrade.')
  }

  const email = user.emailAddresses[0]?.emailAddress

  if (!email) {
    throw new Error('User does not have an email address.')
  }

  const role = user.publicMetadata?.role
  const promoCode = user.publicMetadata?.promoCode as string | undefined

  if (!role) {
    throw new Error('User does not have a role.')
  }

  // Map role to price ID
  let priceId: string | undefined
  if (role === 'player') {
    priceId = STRIPE_PRICES.PLAYER_PRO_YEARLY
  } else if (role === 'coach') {
    priceId = STRIPE_PRICES.COACH_PRO_YEARLY
  }

  if (!priceId) {
    throw new Error('No subscription plan found for your role.')
  }

  const customer = await getOrCreateStripeCustomer({
    clerkUserId: user.id,
    email,
    name: `${user.firstName} ${user.lastName}`,
  })

  // Apply promotion code if user has first year free promo
  const discounts =
    promoCode === 'FIRST_YEAR_FREE'
      ? [
          {
            promotion_code: process.env.STRIPE_FIRST_YEAR_FREE_PROMO_CODE || 'promo_1Sk9fn0YMGbV6JIGp24l0vE5',
          },
        ]
      : undefined

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    discounts,
    return_url: `${appUrl}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    ui_mode: 'embedded',
    metadata: {
      clerkUserId: user.id,
    },
    subscription_data: {
      metadata: {
        clerkUserId: user.id,
      },
    },
  })

  if (!session.client_secret) {
    throw new Error('Failed to create checkout session')
  }

  return session.client_secret
}

export async function createPortalSession() {
  const user = await currentUser()

  if (!user) {
    throw new Error('You must be signed in to manage subscription.')
  }

  const email = user.emailAddresses[0]?.emailAddress
  if (!email) throw new Error('No email found')

  const customer = await getOrCreateStripeCustomer({
    clerkUserId: user.id,
    email,
  })

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${appUrl}/subscription`,
  })

  return session.url
}
