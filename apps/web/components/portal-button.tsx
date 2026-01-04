'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Loader2 } from 'lucide-react'
import { createPortalSession } from '@/actions/stripe-actions'

export function PortalButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handlePortal = async () => {
    try {
      setIsLoading(true)
      const portalUrl = await createPortalSession()
      window.location.href = portalUrl
      setIsLoading(false)
    } catch (error) {
      console.error('Portal error:', error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePortal}
      disabled={isLoading}
      className='w-full'
    >
      {isLoading ? (
        <>
          <Loader2 className='mr-2 h-5 w-5 animate-spin' />
          Loading...
        </>
      ) : (
        'Manage Subscription & Billing'
      )}
    </Button>
  )
}
