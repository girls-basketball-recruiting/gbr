import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: Request) {
  const body = await req.text()
  const headerPayload = await headers()
  const signature = headerPayload.get('Stripe-Signature') as string

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return new NextResponse('Webhook secret not set', { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      if (!session?.metadata?.clerkUserId) {
        console.error('checkout.session.completed: No clerkUserId in metadata')
        return new NextResponse('User id is required', { status: 400 })
      }

      console.log(
        `Processing checkout.session.completed for user ${session.metadata.clerkUserId}`,
      )

      // Retrieve full subscription details to get correct dates and ID
      const subscription = (await stripe.subscriptions.retrieve(
        session.subscription as string,
      )) as Stripe.Subscription

      // Find and update the user using PayloadCMS
      const payload = await getPayload({ config })

      const users = await payload.find({
        collection: 'users',
        where: {
          clerkId: { equals: session.metadata.clerkUserId },
        },
        limit: 1,
      })

      const user = users.docs[0]

      if (user) {
        const firstPrice = subscription.items.data[0]?.price
        const currentPeriodEnd = (subscription as any)
          .current_period_end as number

        await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: firstPrice?.id || null,
            stripeCurrentPeriodEnd: new Date(
              currentPeriodEnd * 1000,
            ).toISOString(),
          },
        })
        console.log(`✅ Updated user ${user.id} with subscription details`)
      } else {
        console.error(
          `User with clerkId ${session.metadata.clerkUserId} not found`,
        )
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice

      // Check if this invoice is related to a subscription
      const invoiceSubscription = (invoice as any).subscription
      const subscriptionId =
        typeof invoiceSubscription === 'string'
          ? invoiceSubscription
          : invoiceSubscription?.id

      if (!subscriptionId) {
        // One-off payment or something else, ignore for now if not subscription related
        return new NextResponse(null, { status: 200 })
      }

      const subscription = (await stripe.subscriptions.retrieve(
        subscriptionId,
      )) as Stripe.Subscription

      console.log(
        `Processing invoice.payment_succeeded for subscription ${subscription.id}`,
      )

      // Find and update the user using PayloadCMS
      const payload = await getPayload({ config })

      const users = await payload.find({
        collection: 'users',
        where: {
          stripeSubscriptionId: { equals: subscription.id },
        },
        limit: 1,
      })

      const user = users.docs[0]

      if (user) {
        const firstPrice = subscription.items.data[0]?.price
        const currentPeriodEnd = (subscription as any)
          .current_period_end as number

        await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            stripeCurrentPeriodEnd: new Date(
              currentPeriodEnd * 1000,
            ).toISOString(),
            stripePriceId: firstPrice?.id || null,
          },
        })
        console.log(`✅ Updated user ${user.id} subscription renewal`)
      } else {
        console.log(
          `User with subscription ${subscription.id} not found (might be first payment handled by checkout.session.completed)`,
        )
      }
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }

  return new NextResponse(null, { status: 200 })
}
