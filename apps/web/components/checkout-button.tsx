'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { createCheckoutSession } from '@/actions/stripe-actions'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function CheckoutButton() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch the client secret on mount
    createCheckoutSession()
      .then((secret) => setClientSecret(secret))
      .catch((err) => {
        console.error('Checkout error:', err)
        setError(err.message || 'Failed to initialize checkout')
      })
  }, [])

  if (error) {
    return (
      <div className='w-full p-6 rounded-lg border text-center'>
        <p className='font-medium mb-2'>Payment Error</p>
        <p className='text-sm'>{error}</p>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className='w-full py-20 flex flex-col items-center justify-center gap-3 rounded-lg border'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <p className='text-sm'>Loading secure checkout...</p>
      </div>
    )
  }

  return (
    <div className='w-full'>
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
