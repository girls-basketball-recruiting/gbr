import { H2, P } from '@/components/ui/typography'
import { Card } from '@workspace/ui/components/card'
import { Loader2 } from 'lucide-react'

export default function CheckoutReturnLoading() {
  return (
    <div className='flex items-center justify-center p-4 mt-20'>
      <Card className='p-12 text-center'>
        <Loader2 className='w-12 h-12 animate-spin mx-auto mb-6' />
        <H2>
          Verifying Payment
        </H2>
        <P>
          Please wait while we confirm your subscription...
        </P>
      </Card>
    </div>
  )
}
