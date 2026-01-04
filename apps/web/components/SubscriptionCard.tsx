import { Card } from '@workspace/ui/components/card'
import { createCheckoutSession, createPortalSession } from '@/actions/stripe-actions'
import { SubscriptionActionButton } from './SubscriptionActionButton'
import { H2 } from './ui/typography/H2'
import { P } from './ui/typography/P'
import { Small } from './ui/typography/Small'

interface SubscriptionCardProps {
  isSubscribed: boolean
  currentPeriodEnd?: string | null
  role: 'player' | 'coach'
}

export function SubscriptionCard({
  isSubscribed,
  currentPeriodEnd,
  role,
}: SubscriptionCardProps) {
  return (
    <Card className='p-6 mb-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <H2>Subscription</H2>
          <P>
            {isSubscribed
              ? `You are subscribed to the ${role === 'coach' ? 'Coach' : 'Player'} Pro plan.`
              : `Upgrade to ${role === 'coach' ? 'Coach' : 'Player'} Pro to unlock all features.`}
          </P>
          {isSubscribed && currentPeriodEnd && (
            <Small>
              Renews on {new Date(currentPeriodEnd).toLocaleDateString()}
            </Small>
          )}
        </div>
        <SubscriptionActionButton
          isSubscribed={isSubscribed}
          createCheckoutSession={createCheckoutSession}
          createPortalSession={createPortalSession}
        />
      </div>
    </Card>
  )
}
