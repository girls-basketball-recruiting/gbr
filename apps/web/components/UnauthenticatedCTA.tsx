import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { Lock, Sparkles } from 'lucide-react'

interface UnauthenticatedCTAProps {
  title: string
  description: string
  playerCTA?: boolean
  coachCTA?: boolean
  variant?: 'default' | 'premium'
}

export function UnauthenticatedCTA({
  title,
  description,
  playerCTA = false,
  coachCTA = false,
  variant = 'default',
}: UnauthenticatedCTAProps) {
  const isPremium = variant === 'premium'

  return (
    <Card className={`${isPremium ? 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200 dark:border-orange-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'} p-8 shadow-lg`}>
      <div className='flex flex-col items-center text-center space-y-4'>
        <div className={`w-16 h-16 rounded-2xl ${isPremium ? 'bg-orange-200 dark:bg-orange-900/50' : 'bg-slate-100 dark:bg-slate-700'} flex items-center justify-center`}>
          {isPremium ? (
            <Sparkles className='w-8 h-8 text-orange-600 dark:text-orange-400' />
          ) : (
            <Lock className='w-8 h-8 text-slate-600 dark:text-slate-400' />
          )}
        </div>
        <div>
          <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-3'>{title}</h3>
          <p className='text-slate-600 dark:text-slate-400 text-base max-w-md'>{description}</p>
        </div>
        <div className='flex flex-col sm:flex-row gap-3 pt-2'>
          {playerCTA && (
            <Button className='bg-orange-600 hover:bg-orange-700' size='lg' asChild>
              <Link href='/register-player'>Sign Up as Player</Link>
            </Button>
          )}
          {coachCTA && (
            <Button className='bg-blue-600 hover:bg-blue-700' size='lg' asChild>
              <Link href='/register-coach'>Sign Up as Coach</Link>
            </Button>
          )}
          {!playerCTA && !coachCTA && (
            <>
              <Button size='lg' className='bg-orange-600 hover:bg-orange-700' asChild>
                <Link href='/register-player'>I&apos;m a Player</Link>
              </Button>
              <Button size='lg' className='bg-blue-600 hover:bg-blue-700' asChild>
                <Link href='/register-coach'>I&apos;m a Coach</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
