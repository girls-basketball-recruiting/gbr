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

  const payload = await getPayload({ config })

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`🔔 WEBHOOK RECEIVED: checkout.session.completed`)
      console.log(`📋 Event ID: ${event.id}`)
      console.log(`📧 Session ID: ${session.id}`)
      console.log(`💳 Payment Status: ${session.payment_status}`)
      console.log(`👤 Customer: ${session.customer}`)
      console.log(`📝 Subscription: ${session.subscription}`)
      console.log(`🏷️  Metadata:`, session.metadata)

      if (!session?.metadata?.clerkUserId) {
        console.error('❌ CRITICAL: No clerkUserId in metadata')
        console.error('💡 This session was created without clerk user metadata')
        return new NextResponse('User id is required', { status: 400 })
      }

      const clerkUserId = session.metadata.clerkUserId
      console.log(`🔄 Processing for Clerk user: ${clerkUserId}`)

      // Verify subscription exists
      if (!session.subscription) {
        console.error('❌ CRITICAL: No subscription in checkout session')
        console.error('💡 This might be a one-time payment, not a subscription')
        return new NextResponse('No subscription found', { status: 400 })
      }

      // Retrieve full subscription details to get correct dates and ID
      console.log(`📥 Fetching subscription details from Stripe...`)
      const subscription = (await stripe.subscriptions.retrieve(
        session.subscription as string,
      )) as Stripe.Subscription
      console.log(`✅ Subscription retrieved: ${subscription.id}`)
      console.log(`📊 Status: ${subscription.status}`)
      console.log(`💰 Price: ${subscription.items.data[0]?.price.id}`)

      // Find user in PayloadCMS
      console.log(`🔍 Looking up user in PayloadCMS by clerkId: ${clerkUserId}`)
      const users = await payload.find({
        collection: 'users',
        where: {
          clerkId: { equals: clerkUserId },
        },
        limit: 1,
      })

      const user = users.docs[0]

      if (!user) {
        console.error(`❌ CRITICAL: User not found in PayloadCMS`)
        console.error(`   Clerk ID: ${clerkUserId}`)
        console.error(`💡 This likely means:`)
        console.error(`   1. Clerk webhook hasn't created PayloadCMS user yet`)
        console.error(`   2. There's a mismatch between Clerk and PayloadCMS`)
        console.error(`   3. Database connection issue`)

        // Return 200 so Stripe doesn't retry (user will be created soon)
        // But log this as a critical issue to investigate
        return new NextResponse('User will be created by Clerk webhook', { status: 200 })
      }

      console.log(`✅ User found in PayloadCMS: ${user.id}`)
      console.log(`📧 Email: ${user.email}`)

      // Check if already has subscription (idempotency)
      if (user.stripeSubscriptionId === subscription.id) {
        console.log(`⚠️  User already has this subscription - webhook retry or race condition`)
        console.log(`   Skipping update to avoid unnecessary writes`)
        return new NextResponse(null, { status: 200 })
      }

      // Prepare update data
      const subscriptionItem = subscription.items.data[0]
      const firstPrice = subscriptionItem?.price
      const subscriptionData = subscription as any
      const subscriptionItemData = subscriptionItem as any

      // current_period_end is in the subscription ITEM, not the subscription itself
      const currentPeriodEnd = subscriptionItemData?.current_period_end as number | undefined
      const createdAt = subscriptionData.created as number | undefined

      console.log(`📦 Raw subscription data:`)
      console.log(`   created: ${createdAt} (${createdAt ? new Date(createdAt * 1000).toISOString() : 'missing'})`)
      console.log(`   current_period_end: ${currentPeriodEnd} (${currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : 'missing'})`)
      console.log(`   Type: ${typeof currentPeriodEnd}`)

      if (!currentPeriodEnd) {
        console.error(`❌ CRITICAL: No current_period_end in subscription item`)
        console.error(`   Subscription has ${subscription.items.data.length} items`)
        console.error(`   Full subscription object:`, JSON.stringify(subscription, null, 2))
        return new NextResponse('Invalid subscription data', { status: 400 })
      }

      // Verify subscription period is approximately one year (allow some buffer)
      if (createdAt && currentPeriodEnd) {
        const periodLengthDays = (currentPeriodEnd - createdAt) / (60 * 60 * 24)
        console.log(`📅 Subscription period length: ${Math.round(periodLengthDays)} days`)

        if (periodLengthDays < 360 || periodLengthDays > 370) {
          console.warn(`⚠️  Warning: Subscription period is not approximately one year (${Math.round(periodLengthDays)} days)`)
        } else {
          console.log(`✅ Subscription period is correctly set to one year`)
        }
      }

      const updateData = {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: firstPrice?.id || null,
        stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000).toISOString(),
      }

      console.log(`📝 Updating user ${user.id} with subscription data:`)
      console.log(`   Subscription ID: ${updateData.stripeSubscriptionId}`)
      console.log(`   Customer ID: ${updateData.stripeCustomerId}`)
      console.log(`   Price ID: ${updateData.stripePriceId}`)
      console.log(`   Period End: ${updateData.stripeCurrentPeriodEnd}`)

      await payload.update({
        collection: 'users',
        id: user.id,
        data: updateData,
      })

      console.log(`✅ SUCCESS: User ${user.id} updated with subscription details`)
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
        `🔄 Processing invoice.payment_succeeded for subscription ${subscription.id}`,
      )

      const users = await payload.find({
        collection: 'users',
        where: {
          stripeSubscriptionId: { equals: subscription.id },
        },
        limit: 1,
      })

      const user = users.docs[0]

      if (user) {
        const subscriptionItem = subscription.items.data[0]
        const firstPrice = subscriptionItem?.price
        const subscriptionItemData = subscriptionItem as any
        const currentPeriodEnd = subscriptionItemData?.current_period_end as number | undefined

        if (currentPeriodEnd) {
          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000).toISOString(),
              stripePriceId: firstPrice?.id || null,
            },
          })
          console.log(`✅ Updated user ${user.id} subscription renewal`)
        } else {
          console.error(`❌ No current_period_end in subscription item for renewal`)
        }
      } else {
        console.log(
          `User with subscription ${subscription.id} not found (might be first payment handled by checkout.session.completed)`,
        )
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription

      console.log(
        `🔄 Processing customer.subscription.updated for subscription ${subscription.id}`,
      )

      const users = await payload.find({
        collection: 'users',
        where: {
          stripeSubscriptionId: { equals: subscription.id },
        },
        limit: 1,
      })

      const user = users.docs[0]

      if (user) {
        const subscriptionItem = subscription.items.data[0]
        const firstPrice = subscriptionItem?.price
        const subscriptionItemData = subscriptionItem as any
        const currentPeriodEnd = subscriptionItemData?.current_period_end as number | undefined

        if (currentPeriodEnd) {
          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000).toISOString(),
              stripePriceId: firstPrice?.id || null,
            },
          })
          console.log(`✅ Updated user ${user.id} subscription details`)
        } else {
          console.error(`❌ No current_period_end in subscription item update`)
        }
      } else {
        console.error(
          `❌ User with subscription ${subscription.id} not found`,
        )
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription

      console.log(
        `🔄 Processing customer.subscription.deleted for subscription ${subscription.id}`,
      )

      const users = await payload.find({
        collection: 'users',
        where: {
          stripeSubscriptionId: { equals: subscription.id },
        },
        limit: 1,
      })

      const user = users.docs[0]

      if (user) {
        // Clear subscription data when canceled
        await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
          },
        })
        console.log(`✅ Cleared subscription data for user ${user.id}`)
      } else {
        console.log(
          `⭕️ User with subscription ${subscription.id} not found (expected)`,
        )
      }
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }

  return new NextResponse(null, { status: 200 })
}
