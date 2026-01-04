import { Card } from '@workspace/ui/components/card'
import { Lock, Sparkles } from 'lucide-react'
import { H3, MutedText } from './ui/typography'
import { ButtonLink } from './ui/ButtonLink'

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
    <Card className={`${isPremium ? 'bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200 dark:border-orange-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'} p-8 shadow-lg`}>
      <div className='flex flex-col items-center text-center space-y-4'>
        <div className={`w-16 h-16 rounded-2xl ${isPremium ? 'bg-orange-200 dark:bg-orange-900/50' : 'bg-slate-100 dark:bg-slate-700'} flex items-center justify-center`}>
          {isPremium ? (
            <Sparkles className='w-8 h-8 text-orange-600 dark:text-orange-400' />
          ) : (
            <Lock className='w-8 h-8 text-slate-600 dark:text-slate-400' />
          )}
        </div>
        <div>
          <H3 className='mb-3'>{title}</H3>
          <MutedText className='max-w-md'>{description}</MutedText>
        </div>
        <div className='flex flex-col sm:flex-row gap-4 pt-2'>
          {playerCTA && (
            <ButtonLink href='/register-player' size='lg'>
              Sign Up as Player
            </ButtonLink>
          )}
          {coachCTA && (
            <ButtonLink href='/register-coach' variant='secondary' size='lg'>
              Sign Up as Coach
            </ButtonLink>
          )}
          {!playerCTA && !coachCTA && (
            <>
              <ButtonLink size='lg' href='/register-player'>
                I&apos;m a Player
              </ButtonLink>
              <ButtonLink size='lg' variant='secondary' href='/register-coach'>
                I&apos;m a Coach
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
