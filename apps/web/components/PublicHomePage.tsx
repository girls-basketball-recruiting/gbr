'use client'

import { Card } from '@workspace/ui/components/card'
import Link from 'next/link'
import { FeatureList } from './ui/FeatureList'
import { PublicHomeNav } from './PublicHomeNav'
import { PlayersSection, ProgramsSection, TournamentsSection, PricingSection } from './PublicHomePageSections'
import { ButtonLink } from './ui/ButtonLink'
import { H1, H2, MutedText, P, Small } from './ui/typography'
import { BriefcaseBusinessIcon, Users2Icon } from 'lucide-react'

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
    <div className='min-h-screen'>
      <PublicHomeNav />

      {/* Hero Section */}
      <section id='home' className='py-20'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-16 max-w-3xl mx-auto'>
            <H1 className='mb-6'>
              Girls Basketball Recruiting Database
            </H1>
            <MutedText className='text-xl'>
              Connecting talented student-athletes with college basketball programs
            </MutedText>
          </div>

          {/* Split CTAs */}
          <div className='grid md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
            {/* For Players */}
            <Card className='p-8'>
              <div className='text-center space-y-6'>
                <div className='w-20 h-20 mx-auto rounded-2xl flex items-center justify-center bg-accent'>
                  <Users2Icon className='w-10 h-10 text-primary' />
                </div>

                <H2>For Players</H2>

                <P>
                  Create your profile and get discovered by college programs
                </P>

                <FeatureList iconColor='text-primary' items={playerFeatures} />

                <ButtonLink href='/register-player' size='lg' className='w-full'>
                  Register as Player
                </ButtonLink>
              </div>
            </Card>

            {/* For Coaches */}
            <Card className='p-8'>
              <div className='text-center space-y-6'>
                <div className='w-20 h-20 mx-auto rounded-2xl flex items-center justify-center bg-accent'>
                  <BriefcaseBusinessIcon className='w-10 h-10 text-blue-500' />
                </div>

                <H2>For Coaches</H2>

                <P>
                  Find talented student-athletes and build your team for the future
                </P>

                <FeatureList iconColor='text-blue-500' items={coachFeatures} />

                <ButtonLink href='/register-coach' size='lg' variant='blue' className='w-full'>
                  Register as Coach
                </ButtonLink>
              </div>
            </Card>
          </div>

          {/* Login CTA */}
          <div className='text-center mt-8'>
            <P className='mb-3'><Small>Already have an account?</Small></P>
            <ButtonLink href='/sign-in' variant='outline'>
              Sign In
            </ButtonLink>
          </div>
        </div>
      </section>

      <PlayersSection />
      <ProgramsSection />
      <TournamentsSection />
      <PricingSection />

      {/* Footer CTA */}
      <section className='py-20 bg-accent'>
        <div className='container mx-auto px-4 text-center'>
          <H2 className='mb-4'>
            Ready to Get Started?
          </H2>
          <p className='text-xl mb-8 max-w-2xl mx-auto'>
            Join hundreds of student-athletes and coaches connecting through our
            platform
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <ButtonLink href='/register-player' size='lg' className='w-full'>
              Register as Player
            </ButtonLink>
            <ButtonLink href='/register-coach' size='lg' variant='blue'>
              Register as Coach
            </ButtonLink>
          </div>
          <MutedText className='mt-6'>
            <Small>
              Already have an account?{' '}
              <Link href='/sign-in' className='underline hover:text-accent-foreground'>
                Sign In
              </Link>
            </Small>
          </MutedText>
        </div>
      </section>
    </div>
  )
}
