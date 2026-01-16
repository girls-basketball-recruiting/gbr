import { redirect } from 'next/navigation'
import { currentUser, clerkClient } from '@clerk/nextjs/server'
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

  // Payment successful - update Clerk metadata immediately
  // (webhook will also do this, but we do it here for faster UX)
  if (!clerkUser.publicMetadata?.hasActiveSubscription) {
    try {
      const client = await clerkClient()
      await client.users.updateUserMetadata(clerkUser.id, {
        publicMetadata: {
          hasActiveSubscription: true,
        },
      })
    } catch (error) {
      console.error('Failed to update subscription status:', error)
    }
  }

  // Redirect to onboarding - it will handle profile creation
  const role = (clerkUser.publicMetadata?.role || clerkUser.unsafeMetadata?.role) as string
  redirect(`/onboarding/${role}`)
}
