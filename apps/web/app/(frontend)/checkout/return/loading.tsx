import { Card } from '@workspace/ui/components/card'
import { Loader2 } from 'lucide-react'

export default function CheckoutReturnLoading() {
  return (
    <div className='min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4'>
      <Card className='bg-slate-800/50 border-slate-700 p-12 text-center'>
        <Loader2 className='w-12 h-12 animate-spin text-blue-400 mx-auto mb-6' />
        <h2 className='text-2xl font-bold text-white mb-2'>
          Verifying Payment
        </h2>
        <p className='text-slate-400'>
          Please wait while we confirm your subscription...
        </p>
      </Card>
    </div>
  )
}
