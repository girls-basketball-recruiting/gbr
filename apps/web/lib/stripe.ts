// import Stripe from 'stripe'

// if (!process.env.STRIPE_SECRET_KEY) {
//   throw new Error('STRIPE_SECRET_KEY is not set')
// }

// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: '2024-12-18.acacia',
//   typescript: true,
// })

// // Price IDs - Replace these with your actual Stripe Price IDs from the dashboard
// export const STRIPE_PRICES = {
//   PLAYER_PRO_YEARLY: process.env.STRIPE_PLAYER_PRO_YEARLY_PRICE_ID || '',
//   COACH_PRO_YEARLY: process.env.STRIPE_COACH_PRO_YEARLY_PRICE_ID || '',
// } as const

// // Helper to get or create a Stripe customer for a Clerk user
// export async function getOrCreateStripeCustomer(params: {
//   clerkUserId: string
//   email: string
//   name?: string
// }) {
//   const { clerkUserId, email, name } = params

//   // Search for existing customer by Clerk user ID in metadata
//   const existingCustomers = await stripe.customers.list({
//     email,
//     limit: 1,
//   })

//   if (existingCustomers.data.length > 0) {
//     const customer = existingCustomers.data[0]
//     // Update metadata if missing
//     if (!customer.metadata.clerkUserId) {
//       await stripe.customers.update(customer.id, {
//         metadata: { clerkUserId },
//       })
//     }
//     return customer
//   }

//   // Create new customer
//   return await stripe.customers.create({
//     email,
//     name,
//     metadata: {
//       clerkUserId,
//     },
//   })
// }

// // Helper to check if user has active subscription
// export async function hasActiveSubscription(stripeCustomerId: string): Promise<boolean> {
//   const subscriptions = await stripe.subscriptions.list({
//     customer: stripeCustomerId,
//     status: 'active',
//     limit: 1,
//   })

//   return subscriptions.data.length > 0
// }
