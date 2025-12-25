'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Loader2 } from 'lucide-react'
import { createCheckoutSession } from '@/actions/stripe-actions'

export function CheckoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      const checkoutUrl = await createCheckoutSession()
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Checkout error:', error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className='w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg'
    >
      {isLoading ? (
        <>
          <Loader2 className='mr-2 h-5 w-5 animate-spin' />
          Loading...
        </>
      ) : (
        'Continue to Payment'
      )}
    </Button>
  )
}
