import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { CheckCircle2 } from 'lucide-react'

export default function CheckoutResultPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4">
      <Card className="max-w-md w-full p-8 text-center border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Payment Successful!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Thank you for upgrading to Pro. Your subscription is now active and your features have been unlocked.
        </p>
        <div className="space-y-4">
          <Link href="/profile" className="block w-full">
            <Button className="w-full">
              Go to Profile
            </Button>
          </Link>
          <Link href="/" className="block w-full">
            <Button variant="outline" className="w-full">
              Return Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
