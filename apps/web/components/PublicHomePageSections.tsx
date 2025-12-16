import { ArrowRight, Users, Building2, Trophy, Check, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'

export function PlayersSection() {
  return (
    <section id='players' className='py-24 bg-white dark:bg-slate-800'>
      <div className='container mx-auto px-4'>
        <div className='grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto'>
          <div className='order-2 md:order-1'>
            <div className='inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-medium mb-4'>
              <Users className='w-4 h-4' />
              Player Profiles
            </div>
            <h2 className='text-4xl font-bold text-slate-900 dark:text-white mb-6'>
              Discover Talented Athletes
            </h2>
            <p className='text-lg text-slate-600 dark:text-slate-400 mb-6'>
              Browse hundreds of student-athlete profiles with detailed stats, highlight
              videos, academic information, and tournament schedules. Filter by
              graduation year, position, GPA, height, and location to find the perfect
              fit for your program.
            </p>
            <ul className='space-y-3 mb-8'>
              {['Detailed athletic and academic profiles', 'Highlight video reels and game footage', 'Advanced filtering by position, GPA, height, and more'].map((item, i) => (
                <li key={i} className='flex items-start gap-3'>
                  <div className='w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5'>
                    <Check className='w-4 h-4 text-orange-600 dark:text-orange-500' />
                  </div>
                  <span className='text-slate-700 dark:text-slate-300'>{item}</span>
                </li>
              ))}
            </ul>
            <Link href='/players'>
              <Button size='lg' className='bg-orange-600 hover:bg-orange-700'>
                Browse Players
                <ArrowRight className='ml-2 w-4 h-4' />
              </Button>
            </Link>
          </div>
          <div className='order-1 md:order-2'>
            <div className='bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 rounded-2xl p-12 aspect-square flex items-center justify-center'>
              <Users className='w-32 h-32 text-orange-400 dark:text-orange-500' />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ProgramsSection() {
  return (
    <section id='programs' className='py-24 bg-slate-50 dark:bg-slate-900'>
      <div className='container mx-auto px-4'>
        <div className='grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto'>
          <div>
            <div className='bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 rounded-2xl p-12 aspect-square flex items-center justify-center'>
              <Building2 className='w-32 h-32 text-blue-400 dark:text-blue-500' />
            </div>
          </div>
          <div>
            <div className='inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium mb-4'>
              <Building2 className='w-4 h-4' />
              College Programs
            </div>
            <h2 className='text-4xl font-bold text-slate-900 dark:text-white mb-6'>
              Explore College Programs
            </h2>
            <p className='text-lg text-slate-600 dark:text-slate-400 mb-6'>
              Search through hundreds of college basketball programs across all
              divisions. View detailed program information, coaching staff, conference
              affiliations, and academic requirements to find the right fit for your
              basketball journey.
            </p>
            <ul className='space-y-3 mb-8'>
              {['Comprehensive program information', 'Filter by division, state, and conference', 'Direct contact information for coaching staff'].map((item, i) => (
                <li key={i} className='flex items-start gap-3'>
                  <div className='w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5'>
                    <Check className='w-4 h-4 text-blue-600 dark:text-blue-500' />
                  </div>
                  <span className='text-slate-700 dark:text-slate-300'>{item}</span>
                </li>
              ))}
            </ul>
            <Link href='/programs'>
              <Button size='lg' className='bg-blue-600 hover:bg-blue-700'>
                Explore Programs
                <ArrowRight className='ml-2 w-4 h-4' />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function TournamentsSection() {
  return (
    <section id='tournaments' className='py-24 bg-white dark:bg-slate-800'>
      <div className='container mx-auto px-4'>
        <div className='grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto'>
          <div className='order-2 md:order-1'>
            <div className='inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium mb-4'>
              <Trophy className='w-4 h-4' />
              Tournaments
            </div>
            <h2 className='text-4xl font-bold text-slate-900 dark:text-white mb-6'>
              Track Tournament Schedules
            </h2>
            <p className='text-lg text-slate-600 dark:text-slate-400 mb-6'>
              Stay updated on upcoming tournaments and exposure events. See which
              players are attending, find the best opportunities to scout talent, and
              plan your recruiting calendar around major showcase events.
            </p>
            <ul className='space-y-3 mb-8'>
              {['Complete tournament calendar with dates and locations', 'See which players are attending each event', 'Plan your recruiting schedule efficiently'].map((item, i) => (
                <li key={i} className='flex items-start gap-3'>
                  <div className='w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5'>
                    <Check className='w-4 h-4 text-purple-600 dark:text-purple-500' />
                  </div>
                  <span className='text-slate-700 dark:text-slate-300'>{item}</span>
                </li>
              ))}
            </ul>
            <Link href='/tournaments'>
              <Button size='lg' className='bg-purple-600 hover:bg-purple-700'>
                View Tournaments
                <ArrowRight className='ml-2 w-4 h-4' />
              </Button>
            </Link>
          </div>
          <div className='order-1 md:order-2'>
            <div className='bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 rounded-2xl p-12 aspect-square flex items-center justify-center'>
              <Trophy className='w-32 h-32 text-purple-400 dark:text-purple-500' />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function PricingSection() {
  return (
    <section id='pricing' className='py-24 bg-slate-50 dark:bg-slate-900'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-16 max-w-3xl mx-auto'>
          <div className='inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-medium mb-4'>
            <DollarSign className='w-4 h-4' />
            Pricing
          </div>
          <h2 className='text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6'>
            Simple, Transparent Pricing
          </h2>
          <p className='text-xl text-slate-600 dark:text-slate-400'>
            Get full access to all features and connect with recruits
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
          {/* Free Plan */}
          <Card className='bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-8'>
            <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>Free</h3>
            <p className='text-slate-600 dark:text-slate-400 mb-6'>For players getting started</p>
            <div className='mb-6'>
              <span className='text-4xl font-bold text-slate-900 dark:text-white'>$0</span>
              <span className='text-slate-600 dark:text-slate-400'>/year</span>
            </div>
            <ul className='space-y-3 mb-8'>
              {['Create player profile', 'Basic profile visibility', 'Tournament registration'].map((feature) => (
                <li key={feature} className='flex items-start gap-2'>
                  <Check className='w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5' />
                  <span className='text-slate-700 dark:text-slate-300 text-sm'>{feature}</span>
                </li>
              ))}
            </ul>
            <Link href='/register-player'>
              <Button variant='outline' className='w-full'>Get Started</Button>
            </Link>
          </Card>

          {/* Player Premium */}
          <Card className='bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200 dark:border-orange-800 p-8 relative'>
            <div className='absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium'>
              Most Popular
            </div>
            <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>Player Pro</h3>
            <p className='text-slate-700 dark:text-slate-300 mb-6'>For serious recruits</p>
            <div className='mb-6'>
              <span className='text-4xl font-bold text-slate-900 dark:text-white'>$39</span>
              <span className='text-slate-700 dark:text-slate-300'>/year</span>
            </div>
            <ul className='space-y-3 mb-8'>
              {[
                'Everything in Free',
                'Enhanced profile visibility',
                'Video highlight uploads',
                'Direct messaging with coaches',
                'Priority listing in searches',
              ].map((feature) => (
                <li key={feature} className='flex items-start gap-2'>
                  <Check className='w-5 h-5 text-orange-600 dark:text-orange-500 flex-shrink-0 mt-0.5' />
                  <span className='text-slate-700 dark:text-slate-300 text-sm'>{feature}</span>
                </li>
              ))}
            </ul>
            <Link href='/register-player'>
              <Button className='w-full bg-orange-600 hover:bg-orange-700'>Upgrade Now</Button>
            </Link>
          </Card>

          {/* Coach Premium */}
          <Card className='bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-8'>
            <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>Coach Pro</h3>
            <p className='text-slate-600 dark:text-slate-400 mb-6'>For college recruiters</p>
            <div className='mb-6'>
              <span className='text-4xl font-bold text-slate-900 dark:text-white'>$99</span>
              <span className='text-slate-600 dark:text-slate-400'>/year</span>
            </div>
            <ul className='space-y-3 mb-8'>
              {[
                'Unlimited player searches',
                'Save unlimited players',
                'Advanced filtering',
                'Direct messaging',
                'Recruiting board tools',
              ].map((feature) => (
                <li key={feature} className='flex items-start gap-2'>
                  <Check className='w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5' />
                  <span className='text-slate-700 dark:text-slate-300 text-sm'>{feature}</span>
                </li>
              ))}
            </ul>
            <Link href='/register-coach'>
              <Button variant='outline' className='w-full'>Get Started</Button>
            </Link>
          </Card>
        </div>
      </div>
    </section>
  )
}
