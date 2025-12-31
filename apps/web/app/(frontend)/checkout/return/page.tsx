import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { stripe } from '@/lib/stripe'

interface CheckoutReturnPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutReturnPage({ searchParams }: CheckoutReturnPageProps) {
  const { session_id } = await searchParams

  if (!session_id) {
    redirect('/payment')
  }

  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect('/sign-in')
  }

  // Retrieve the checkout session from Stripe
  let session
  try {
    session = await stripe.checkout.sessions.retrieve(session_id)
  } catch (error) {
    console.error('Error retrieving checkout session:', error)
    redirect('/payment')
  }

  if (session.payment_status !== 'paid') {
    // Payment not completed, redirect back to payment page
    redirect('/payment')
  }

  // Payment successful, check user's profile status
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

  if (!user) {
    // User doesn't exist yet (should be created by webhook)
    // Redirect to onboarding and let it handle the waiting
    redirect(`/onboarding/${role}`)
  }

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
