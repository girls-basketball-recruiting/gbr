import { Card } from '@workspace/ui/components/card'
import { CheckCircle2 } from 'lucide-react'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { H1, P } from '@/components/ui/typography'

export default function CheckoutResultPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-emerald-500" />
        </div>
        <H1>
          Payment Successful!
        </H1>
        <P>
          Thank you for upgrading to Pro. Your subscription is now active and your features have been unlocked.
        </P>
        <div className="space-y-4">
          <ButtonLink href="/profile">
            Go to Profile
          </ButtonLink>
          <ButtonLink href="/" variant='outline'>
            Return Home
          </ButtonLink>
        </div>
      </Card>
    </div>
  )
}
