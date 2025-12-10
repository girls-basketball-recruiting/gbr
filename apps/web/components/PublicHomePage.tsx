import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import Link from 'next/link'
import { FeatureList } from './ui/FeatureList'

const playerFeatures = [
  'Build your athletic profile',
  'Upload highlight videos',
  'Connect with coaches',
]

const coachFeatures = [
  'Search player database',
  'View highlight reels',
  'Build your recruiting board',
]

export default function PublicHomePage() {
  return (
    <div className='min-h-svh bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center'>
      {/* Hero Section */}
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center mb-10 max-w-2xl mx-auto'>
          <h1 className='text-4xl md:text-5xl font-bold text-white mb-4'>
            Girls Basketball Recruiting Database
          </h1>
          <p className='text-lg text-slate-300'>
            Connecting talented student-athletes with college basketball
            programs
          </p>
        </div>

        {/* Split CTAs */}
        <div className='grid md:grid-cols-2 gap-6 max-w-2xl mx-auto'>
          {/* For Players */}
          <Card className='bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all'>
            <div className='text-center space-y-4'>
              <div className='w-20 h-20 mx-auto bg-orange-500/10 rounded-full flex items-center justify-center'>
                <svg
                  className='w-10 h-10 text-orange-500'
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

              <h2 className='text-2xl font-bold text-white'>For Players</h2>

              <p className='text-sm text-slate-300'>
                Create your profile and get discovered by college coaches
              </p>

              <FeatureList items={playerFeatures} iconColor='text-orange-500' />

              <Link href='/register-player'>
                <Button
                  size='lg'
                  className='w-full bg-orange-500 hover:bg-orange-600 text-white'
                >
                  Register as Player
                </Button>
              </Link>
            </div>
          </Card>

          {/* For Coaches */}
          <Card className='bg-slate-800/50 border-slate-700 p-6 hover:bg-slate-800/70 transition-all'>
            <div className='text-center space-y-4'>
              <div className='w-20 h-20 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center'>
                <svg
                  className='w-10 h-10 text-blue-500'
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

              <h2 className='text-2xl font-bold text-white'>For Coaches</h2>

              <p className='text-sm text-slate-300'>
                Find talented student-athletes and build your team for the future
              </p>

              <FeatureList items={coachFeatures} iconColor='text-blue-500' />

              <Link href='/register-coach'>
                <Button
                  size='lg'
                  className='w-full bg-blue-500 hover:bg-blue-600 text-white'
                >
                  Register as Coach
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Login CTA */}
        <div className='text-center mt-8'>
          <p className='text-slate-400 mb-3 text-sm'>Already have an account?</p>
          <Link href='/sign-in'>
            <Button
              variant='outline'
              className='border-slate-600 text-white hover:bg-slate-800'
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
