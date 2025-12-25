import Stripe from 'stripe'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

// Price IDs - Replace these with your actual Stripe Price IDs from the dashboard
export const STRIPE_PRICES = {
  PLAYER_PRO_YEARLY: process.env.STRIPE_PLAYER_PRO_YEARLY_PRICE_ID || '',
  COACH_PRO_YEARLY: process.env.STRIPE_COACH_PRO_YEARLY_PRICE_ID || '',
} as const

const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

// Helper to get or create a Stripe customer for a Clerk user
export async function getOrCreateStripeCustomer(params: {
  clerkUserId: string
  email: string
  name?: string
}) {
  const { clerkUserId, email, name } = params

  // Search for existing customer by Clerk user ID in metadata
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    const customer = existingCustomers.data[0]!
    // Update metadata if missing
    if (!customer.metadata.clerkUserId) {
      await stripe.customers.update(customer.id, {
        metadata: { clerkUserId },
      })
    }
    return customer
  }

  // Create new customer
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      clerkUserId,
    },
  })
}

// Helper to check if user has active subscription
export async function hasActiveSubscription(stripeCustomerId: string): Promise<boolean> {
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: 'active',
    limit: 1,
  })

  return subscriptions.data.length > 0
}

export async function createCheckoutSession() {
  'use server'

  const user = await currentUser()

  if (!user) {
    throw new Error('You must be signed in to upgrade.')
  }

  const email = user.emailAddresses[0]?.emailAddress

  if (!email) {
    throw new Error('User does not have an email address.')
  }

  const role = user.publicMetadata?.role

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

  // Check if user already has an active subscription
  // (Optional: Redirect to portal if they do, but we'll assume the UI handles showing "Manage" vs "Upgrade")

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
    success_url: `${appUrl}/checkout/result?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/profile`,
    metadata: {
      clerkUserId: user.id,
    },
    subscription_data: {
      metadata: {
        clerkUserId: user.id,
      },
    },
  })

  if (!session.url) {
    throw new Error('Failed to create checkout session')
  }

  redirect(session.url)
}

export async function createPortalSession() {
  'use server'

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
    return_url: `${appUrl}/profile`,
  })

  redirect(session.url)
}
