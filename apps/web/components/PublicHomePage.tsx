'use client'

import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import Link from 'next/link'
import { FeatureList } from './ui/FeatureList'
import { PublicHomeNav } from './PublicHomeNav'
import { PlayersSection, ProgramsSection, TournamentsSection, PricingSection } from './PublicHomePageSections'

const playerFeatures = [
  'Build your athletic profile',
  'Upload highlight videos',
  'Connect with college programs',
]

const coachFeatures = [
  'Search player database',
  'View highlight reels',
  'Build your recruiting board',
]

export default function PublicHomePage() {
  return (
    <div className='min-h-screen bg-white dark:bg-slate-900'>
      <PublicHomeNav />

      {/* Hero Section */}
      <section id='home' className='py-20 bg-gradient-to-br from-orange-50 to-white dark:from-slate-900 dark:to-slate-800'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-16 max-w-3xl mx-auto'>
            <h1 className='text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6'>
              Girls Basketball Recruiting Database
            </h1>
            <p className='text-xl text-slate-600 dark:text-slate-400'>
              Connecting talented student-athletes with college basketball programs
            </p>
          </div>

          {/* Split CTAs */}
          <div className='grid md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
            {/* For Players */}
            <Card className='bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-8 hover:shadow-xl transition-all'>
              <div className='text-center space-y-6'>
                <div className='w-20 h-20 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center'>
                  <svg
                    className='w-10 h-10 text-orange-600 dark:text-orange-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                </div>

                <h2 className='text-3xl font-bold text-slate-900 dark:text-white'>For Players</h2>

                <p className='text-slate-600 dark:text-slate-400'>
                  Create your profile and get discovered by college programs
                </p>

                <FeatureList items={playerFeatures} iconColor='text-orange-600 dark:text-orange-500' />

                <Link href='/register-player'>
                  <Button
                    size='lg'
                    className='w-full bg-orange-600 hover:bg-orange-700 text-white cursor-pointer'
                  >
                    Register as Player
                  </Button>
                </Link>
              </div>
            </Card>

            {/* For Coaches */}
            <Card className='bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-8 hover:shadow-xl transition-all'>
              <div className='text-center space-y-6'>
                <div className='w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center'>
                  <svg
                    className='w-10 h-10 text-blue-600 dark:text-blue-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                </div>

                <h2 className='text-3xl font-bold text-slate-900 dark:text-white'>For Coaches</h2>

                <p className='text-slate-600 dark:text-slate-400'>
                  Find talented student-athletes and build your team for the future
                </p>

                <FeatureList items={coachFeatures} iconColor='text-blue-600 dark:text-blue-500' />

                <Link href='/register-coach'>
                  <Button
                    size='lg'
                    className='w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  >
                    Register as Coach
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Login CTA */}
          <div className='text-center mt-8'>
            <p className='text-slate-500 dark:text-slate-400 mb-3 text-sm'>Already have an account?</p>
            <Link href='/sign-in'>
              <Button variant='secondary' className='cursor-pointer'>
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PlayersSection />
      <ProgramsSection />
      <TournamentsSection />
      <PricingSection />

      {/* Footer CTA */}
      <section className='py-20 bg-linear-to-br from-orange-600 to-orange-700 dark:from-orange-700 dark:to-orange-800'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-4xl font-bold text-white mb-4'>
            Ready to Get Started?
          </h2>
          <p className='text-xl text-orange-100 mb-8 max-w-2xl mx-auto'>
            Join hundreds of student-athletes and coaches connecting through our
            platform
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <Link href='/register-player'>
              <Button
                size='lg'
                className='bg-white text-orange-600 hover:bg-orange-50 cursor-pointer'
              >
                Register as Player
              </Button>
            </Link>
            <Link href='/register-coach'>
              <Button
                size='lg'
                variant='outline'
                className='cursor-pointer'
              >
                Register as Coach
              </Button>
            </Link>
          </div>
          <p className='text-orange-100 mt-6 text-sm'>
            Already have an account?{' '}
            <Link href='/sign-in' className='underline font-medium cursor-pointer'>
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
