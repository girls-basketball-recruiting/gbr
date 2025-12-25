'use client'

import { Button } from '@workspace/ui/components/button'
import { toast } from 'sonner'
import { useTransition } from 'react'

interface SubscriptionActionButtonProps {
  isSubscribed: boolean
  createCheckoutSession: () => Promise<void>
  createPortalSession: () => Promise<void>
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
          await createPortalSession()
        } else {
          await createCheckoutSession()
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
