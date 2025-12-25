import { Card } from '@workspace/ui/components/card'
import { createCheckoutSession, createPortalSession } from '@/lib/stripe'
import { SubscriptionActionButton } from './SubscriptionActionButton'

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
    <Card className='p-6 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 mb-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
            Subscription
          </h2>
          <p className='text-slate-600 dark:text-slate-400'>
            {isSubscribed
              ? `You are subscribed to the ${role === 'coach' ? 'Coach' : 'Player'} Pro plan.`
              : `Upgrade to ${role === 'coach' ? 'Coach' : 'Player'} Pro to unlock all features.`}
          </p>
          {isSubscribed && currentPeriodEnd && (
            <p className='text-sm text-slate-500 mt-1'>
              Renews on {new Date(currentPeriodEnd).toLocaleDateString()}
            </p>
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
