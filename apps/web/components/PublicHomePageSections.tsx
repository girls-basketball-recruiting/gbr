import { ArrowRight, Users, Building2, Trophy, Check, DollarSign } from 'lucide-react'
import { Card } from '@workspace/ui/components/card'
import { ButtonLink } from './ui/ButtonLink'
import { H2, P } from './ui/typography'

export function PlayersSection() {
  return (
    <section id='players' className='py-24 bg-accent'>
      <div className='container mx-auto px-4'>
        <div className='grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto'>
          <div className='order-2 md:order-1'>
            <div className='inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-primary rounded-full text-sm font-medium mb-4'>
              <Users className='w-4 h-4' />
              Player Profiles
            </div>
            <H2 className='mb-6'>
              Discover Talented Athletes
            </H2>
            <p className='text-lg mb-6'>
              Browse hundreds of student-athlete profiles with detailed stats, highlight
              videos, academic information, and tournament schedules. Filter by
              graduation year, position, GPA, height, and location to find the perfect
              fit for your program.
            </p>
            <ul className='space-y-3 mb-8'>
              {['Detailed athletic and academic profiles', 'Highlight video reels and game footage', 'Advanced filtering by position, GPA, height, and more'].map((item, i) => (
                <li key={i} className='flex items-start gap-3'>
                  <div className='w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-primary'>
                    <Check className='w-4 h-4 text-accent' />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <ButtonLink href='/players' size='lg'>
              Browse Players
              <ArrowRight className='ml-2 w-4 h-4' />
            </ButtonLink>
          </div>
          <div className='order-1 md:order-2'>
            <div className='bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 rounded-2xl p-12 aspect-square flex items-center justify-center'>
              <Users className='w-32 h-32 text-primary' />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ProgramsSection() {
  return (
    <section id='programs' className='py-24'>
      <div className='container mx-auto px-4'>
        <div className='grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto'>
          <div className='bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 rounded-2xl p-12 aspect-square flex items-center justify-center'>
            <div className='rounded-2xl p-12 aspect-square flex items-center justify-center'>
              <Building2 className='w-32 h-32 text-blue-500' />
            </div>
          </div>
          <div>
            <div className='inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium mb-4'>
              <Building2 className='w-4 h-4' />
              College Programs
            </div>
            <H2 className='mb-6'>
              Explore College Programs
            </H2>
            <P className='text-lg mb-6'>
              Search through hundreds of college basketball programs across all
              divisions. View detailed program information, coaching staff, conference
              affiliations, and academic requirements to find the right fit for your
              basketball journey.
            </P>
            <ul className='space-y-3 mb-8'>
              {['Comprehensive program information', 'Filter by division, state, and conference', 'Direct contact information for coaching staff'].map((item, i) => (
                <li key={i} className='flex items-start gap-3'>
                  <div className='w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-blue-500'>
                    <Check className='w-4 h-4 text-accent' />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <ButtonLink href='/programs' size='lg' variant='blue'>
              Explore Programs
              <ArrowRight className='ml-2 w-4 h-4' />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}

export function TournamentsSection() {
  return (
    <section id='tournaments' className='py-24 bg-accent'>
      <div className='container mx-auto px-4'>
        <div className='grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto'>
          <div className='order-2 md:order-1'>
            <div className='inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium mb-4'>
              <Trophy className='w-4 h-4' />
              AAU Tournaments
            </div>
            <H2 className='mb-6'>
              Track Tournament Schedules
            </H2>
            <p className='text-lg mb-6'>
              Stay updated on upcoming AAU tournaments and exposure events. See which
              players are attending, find the best opportunities to scout talent, and
              plan your recruiting calendar around major showcase events.
            </p>
            <ul className='space-y-3 mb-8'>
              {['Complete tournament calendar with dates and locations', 'See which players are attending each event', 'Plan your recruiting schedule efficiently'].map((item, i) => (
                <li key={i} className='flex items-start gap-3'>
                  <div className='w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-purple-500'>
                    <Check className='w-4 h-4 text-accent' />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <ButtonLink href='/tournaments' size='lg' variant='purple'>
              View Tournaments
              <ArrowRight className='ml-2 w-4 h-4' />
            </ButtonLink>
          </div>
          <div className='order-1 md:order-2'>
            <div className='bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 rounded-2xl p-12 aspect-square flex items-center justify-center'>
              <Trophy className='w-32 h-32 text-purple-500' />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function PricingSection() {
  return (
    <section id='pricing' className='py-24'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-16 max-w-3xl mx-auto'>
          <div className='inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium mb-4'>
            <DollarSign className='w-4 h-4' />
            Pricing
          </div>
          <H2 className='mb-6'>
            Simple, Transparent Pricing
          </H2>
          <P className='text-xl'>
            Get full access to all features and connect with recruits
          </P>
        </div>

        <div className='grid md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
          {/* Player Pro */}
          <Card className='bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200 dark:border-orange-800 p-8 relative flex flex-col'>
            <div className='absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium'>
              For Players
            </div>
            <div className='flex flex-col justify-between flex-1'>
              <div>
                <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>Player Pro</h3>
                <p className='text-slate-700 dark:text-slate-300 mb-6'>Connect with college programs</p>
                <div className='mb-6'>
                  <span className='text-4xl font-bold text-slate-900 dark:text-white'>$39</span>
                  <span className='text-slate-700 dark:text-slate-300'>/year</span>
                </div>
                <ul className='space-y-3 mb-8'>
                  {[
                    'Create and manage your player profile',
                    'Upload stats, highlights, and achievements',
                    'Get discovered by college programs',
                    'Tournament and showcase visibility',
                  ].map((feature) => (
                    <li key={feature} className='flex items-start gap-2'>
                      <Check className='w-5 h-5 text-orange-600 dark:text-orange-500 shrink-0 mt-0.5' />
                      <span className='text-slate-700 dark:text-slate-300 text-sm'>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <ButtonLink href='/register-player' className='w-full'>
                Register as Player
              </ButtonLink>
            </div>
          </Card>

          {/* Coach Pro */}
          <Card className='bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800 p-8 relative flex flex-col'>
            <div className='absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium'>
              For Coaches
            </div>
            <div className='flex flex-col justify-between flex-1'>
              <div>
                <h3 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>Coach Pro</h3>
                <p className='text-slate-700 dark:text-slate-300 mb-6'>Find talented recruits</p>
                <div className='mb-6'>
                  <span className='text-4xl font-bold text-slate-900 dark:text-white'>$99</span>
                  <span className='text-slate-700 dark:text-slate-300'>/year</span>
                </div>
                <ul className='space-y-3 mb-8'>
                  {[
                    'Search and filter thousands of players',
                    'Save players to your recruiting list',
                    'Add private notes and track prospects',
                    'Access to player athletic stats',
                  ].map((feature) => (
                    <li key={feature} className='flex items-start gap-2'>
                      <Check className='w-5 h-5 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5' />
                      <span className='text-slate-700 dark:text-slate-300 text-sm'>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <ButtonLink href='/register-coach' variant='blue' className='w-full'>
                Register as Coach
              </ButtonLink>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
