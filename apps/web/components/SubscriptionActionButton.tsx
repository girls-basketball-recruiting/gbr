'use client'

import { Button } from '@workspace/ui/components/button'
import { toast } from 'sonner'
import { useTransition } from 'react'

interface SubscriptionActionButtonProps {
  isSubscribed: boolean
  createCheckoutSession: () => Promise<string>
  createPortalSession: () => Promise<string>
}

export function SubscriptionActionButton({
  isSubscribed,
  createCheckoutSession,
  createPortalSession,
}: SubscriptionActionButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      try {
        if (isSubscribed) {
          const portalUrl = await createPortalSession()
          window.location.href = portalUrl
        } else {
          const checkoutUrl = await createCheckoutSession()
          window.location.href = checkoutUrl
        }
      } catch (error) {
        console.error(error)
        toast.error('Something went wrong. Please try again.')
      }
    })
  }

  return (
    <Button
      onClick={handleClick}
      variant={isSubscribed ? 'outline' : 'default'}
      disabled={isPending}
    >
      {isPending
        ? 'Loading...'
        : isSubscribed
          ? 'Manage Subscription'
          : 'Upgrade to Pro'}
    </Button>
  )
}
