import type { Player, CoachProspect, Tournament } from '@/payload-types'
import Image from 'next/image'
import { getPositionLabel } from '@/lib/zod/Positions'
import { formatHeight } from '@/lib/formatters'
import { getAAUCircuitLabel } from '@/lib/zod/AauCircuits'
import { getGeographicAreaLabel } from '@/lib/zod/GeographicAreas'
import { getAreaOfStudyLabel } from '@/lib/zod/AreasOfStudy'
import { getDistanceFromHomeLabel } from '@/lib/zod/DistanceFromHome'
import { getLevelOfPlayLabel } from '@/lib/zod/LevelsOfPlay'
import { CopyableText } from './copyable-text'
import { MailIcon, PhoneIcon, Play, ExternalLink, Calendar, MapPin, User, FileText } from 'lucide-react'
import { X as XIcon } from 'lucide-react'
import { Instagram } from 'lucide-react'
import { H1, H2, H3, P, Small } from '../ui/typography'

type ProfileData = Player | CoachProspect

interface ProfileViewProps {
  profile: ProfileData
  variant: 'player' | 'prospect'
  tournamentSchedule: Tournament[]
}

function isPlayer(profile: ProfileData): profile is Player {
  return 'user' in profile && 'email' in profile
}

function DataPoint({
  label,
  value,
}: {
  label: string
  value: string | number | undefined | null
}) {
  if (!value) return null
  return (
    <div>
      <dt className='text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-1'>
        {label}
      </dt>
      <dd className='text-base text-slate-900 dark:text-white font-medium'>
        {value}
      </dd>
    </div>
  )
}

function getVideoTitle(url: string, index: number): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return `YouTube Highlight ${index + 1}`
  }
  if (url.includes('hudl.com')) {
    return `Hudl Highlight ${index + 1}`
  }
  return `Highlight Video ${index + 1}`
}

const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }

  if (startDate.toDateString() === endDate.toDateString()) {
    return startDate.toLocaleDateString('en-US', options)
  }

  const startFormatted = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  const endFormatted = endDate.toLocaleDateString('en-US', options)

  return `${startFormatted} - ${endFormatted}`
}

export function ProfileView({
  profile,
  variant,
  tournamentSchedule,
}: ProfileViewProps) {
  const email = isPlayer(profile) ? profile.email : null
  const notes = !isPlayer(profile) ? profile.notes : null

  return (
    <div className='space-y-16 max-w-2xl'>
      {/* Hero Section */}
      <div className='relative'>
        <div className='flex flex-col md:flex-row gap-8 md:gap-12 items-start'>
          {/* Profile Image */}
          {profile.profileImageUrl ? (
            <div className='w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden bg-accent relative shrink-0'>
              <Image
                src={profile.profileImageUrl}
                alt={`${profile.firstName} ${profile.lastName}`}
                fill
                className='object-cover'
                priority
              />
            </div>
          ) : (
            <div className={`w-48 h-48 md:w-56 md:h-56 rounded-xl flex items-center justify-center shrink-0 ${
              variant === 'player'
                ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                : 'bg-gradient-to-br from-purple-500 to-purple-600'
            }`}>
              <User className='w-20 h-20 text-white/80' />
            </div>
          )}

          {/* Name & Key Info */}
          <div className='flex-1 pt-2'>
            <div className='flex items-center gap-3 mb-2'>
              <H1 className='text-left'>
                {profile.firstName} {profile.lastName}
              </H1>
              {variant === 'prospect' && (
                <span className='px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-full'>
                  Prospect
                </span>
              )}
            </div>
            <div className='flex flex-wrap items-center gap-3 text-lg mb-6'>
              {profile.primaryPosition && (
                <>
                  <span className='font-medium'>
                    {getPositionLabel(profile.primaryPosition)}
                  </span>
                  {profile.secondaryPosition && (
                    <>
                      <span>/</span>
                      <span className='font-medium'>
                        {getPositionLabel(profile.secondaryPosition)}
                      </span>
                    </>
                  )}
                  <span>•</span>
                </>
              )}
              {profile.graduationYear && (
                <span className='font-semibold'>
                  Class of {profile.graduationYear}
                </span>
              )}
            </div>

            {/* Contact Links */}
            {(email ||
              profile.phoneNumber ||
              profile.xHandle ||
              profile.instaHandle) && (
              <div className='flex flex-col gap-2 mb-6'>
                {email && (
                  <CopyableText
                    icon={<MailIcon className='w-4 h-4' />}
                    text={email}
                    successMsg='Email copied to clipboard!'
                    errorMsg='Failed to copy email'
                  />
                )}
                {profile.phoneNumber && (
                  <CopyableText
                    icon={<PhoneIcon className='w-4 h-4' />}
                    text={profile.phoneNumber}
                    successMsg='Phone number copied to clipboard!'
                    errorMsg='Failed to copy phone number'
                  />
                )}
                {profile.xHandle && (
                  <a
                    href={`https://x.com/${profile.xHandle.replace('@', '')}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline'
                  >
                    <XIcon className='w-4 h-4' />@
                    {profile.xHandle.replace('@', '')}
                  </a>
                )}
                {profile.instaHandle && (
                  <a
                    href={`https://instagram.com/${profile.instaHandle.replace('@', '')}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline'
                  >
                    <Instagram className='w-4 h-4' />@
                    {profile.instaHandle.replace('@', '')}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coach Notes Section (Prospect only) */}
      {variant === 'prospect' && notes && (
        <div className='p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800'>
          <div className='flex items-center gap-2 mb-3'>
            <FileText className='w-5 h-5 text-purple-600 dark:text-purple-400' />
            <H2 className='text-sm uppercase text-purple-700 dark:text-purple-300'>
              Your Private Notes
            </H2>
          </div>
          <P className='whitespace-pre-wrap text-purple-900 dark:text-purple-100'>
            {notes}
          </P>
        </div>
      )}

      {/* Bio Section */}
      {profile.bio && (
        <div className='max-w-3xl'>
          <H2 className='text-sm uppercase mb-4'>
            About
          </H2>
          <P className='text-lg whitespace-pre-wrap'>
            {profile.bio}
          </P>
        </div>
      )}

      {/* Stats Grid */}
      {(profile.heightInInches || profile.weight || profile.ppg || profile.rpg || profile.apg || profile.weightedGpa || profile.unweightedGpa || profile.ncaaId) && (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 py-8 border-y'>
          <DataPoint
            label='Height'
            value={
              profile.heightInInches
                ? formatHeight(profile.heightInInches)
                : undefined
            }
          />
          <DataPoint
            label='Weight'
            value={profile.weight ? `${profile.weight} lbs` : undefined}
          />
          <DataPoint label='PPG' value={profile.ppg} />
          <DataPoint label='RPG' value={profile.rpg} />
          <DataPoint label='APG' value={profile.apg} />
          <DataPoint label='Weighted GPA' value={profile.weightedGpa} />
          <DataPoint label='Unweighted GPA' value={profile.unweightedGpa} />
          {profile.ncaaId && (
            <DataPoint label='NCAA Eligibility ID' value={profile.ncaaId} />
          )}
        </div>
      )}

      {/* High School & Location */}
      {(profile.highSchool || profile.city || profile.state) && (
        <div>
          <H2 className='text-sm uppercase mb-4'>
            High School
          </H2>
          {profile.highSchool && (
            <P className='text-2xl mb-2'>
              {profile.highSchool}
            </P>
          )}
          {(profile.city || profile.state) && (
            <P className='text-lg'>
              {profile.city}
              {profile.city && profile.state && ', '}
              {profile.state}
            </P>
          )}
        </div>
      )}

      {/* AAU Information */}
      {(profile.aauProgramName ||
        profile.aauTeamName ||
        profile.aauCircuit ||
        profile.aauCoach) && (
        <div>
          <H2 className='text-sm uppercase mb-6'>
            AAU Basketball
          </H2>
          <dl className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <DataPoint label='Program' value={profile.aauProgramName} />
            <DataPoint label='Team' value={profile.aauTeamName} />
            <DataPoint
              label='Circuit'
              value={getAAUCircuitLabel(profile.aauCircuit)}
            />
            <DataPoint label='Coach' value={profile.aauCoach} />
          </dl>
        </div>
      )}

      {/* Awards */}
      {profile.awards && profile.awards.length > 0 && (
        <div>
          <H2 className='text-sm uppercase mb-6'>
            Awards & Achievements
          </H2>
          <div className='space-y-6'>
            {profile.awards.map((award: any, index: number) => (
              <div
                key={index}
                className='border-l-2 pl-4'
              >
                <div className='flex items-baseline gap-3 mb-1'>
                  <H3 className='text-lg'>
                    {award.title}
                  </H3>
                  {award.year && (
                    <Small className='text-sm'>
                      {award.year}
                    </Small>
                  )}
                </div>
                {award.description && (
                  <P>
                    {award.description}
                  </P>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* College Preferences */}
      {((profile.desiredLevelsOfPlay && profile.desiredLevelsOfPlay.length > 0) ||
        (profile.desiredGeographicAreas && profile.desiredGeographicAreas.length > 0) ||
        profile.desiredDistanceFromHome ||
        (profile.potentialAreasOfStudy && profile.potentialAreasOfStudy.length > 0) ||
        profile.interestedInMilitaryAcademies ||
        profile.interestedInUltraHighAcademics ||
        profile.interestedInFaithBased ||
        profile.interestedInAllGirls ||
        profile.interestedInHBCU) && (
        <div>
          <H2 className='text-sm uppercase mb-6'>
            College Preferences
          </H2>
          <dl className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {profile.desiredLevelsOfPlay &&
              profile.desiredLevelsOfPlay.length > 0 && (
                <div>
                  <dt className='text-xs uppercase mb-2'>
                    Desired Levels
                  </dt>
                  <dd className='flex flex-wrap gap-2'>
                    {profile.desiredLevelsOfPlay.map((level: string) => (
                      <span
                        key={level}
                        className='px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 rounded-full text-sm font-medium'
                      >
                        {getLevelOfPlayLabel(level) || level}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            {profile.desiredGeographicAreas &&
              profile.desiredGeographicAreas.length > 0 && (
                <div>
                  <dt className='text-xs uppercase mb-2'>
                    Geographic Preferences
                  </dt>
                  <dd className='flex flex-wrap gap-2'>
                    {profile.desiredGeographicAreas.map((area: string) => (
                      <span
                        key={area}
                        className='px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-full text-sm font-medium'
                      >
                        {getGeographicAreaLabel(area) || area}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            {profile.desiredDistanceFromHome && (
              <DataPoint
                label='Desired Distance from Home'
                value={getDistanceFromHomeLabel(profile.desiredDistanceFromHome)}
              />
            )}
            {profile.potentialAreasOfStudy &&
              profile.potentialAreasOfStudy.length > 0 && (
                <div>
                  <dt className='text-xs uppercase tracking-wider mb-2'>
                    Areas of Study
                  </dt>
                  <dd className='flex flex-wrap gap-2'>
                    {profile.potentialAreasOfStudy.map((area: string) => (
                      <span
                        key={area}
                        className='px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300 rounded-full text-sm font-medium'
                      >
                        {getAreaOfStudyLabel(area) || area}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
          </dl>

          {/* Special Interests */}
          {(profile.interestedInMilitaryAcademies ||
            profile.interestedInUltraHighAcademics ||
            profile.interestedInFaithBased ||
            profile.interestedInAllGirls ||
            profile.interestedInHBCU) && (
            <div className='mt-6'>
              <dt className='text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-2'>
                Special Interests
              </dt>
              <dd className='flex flex-wrap gap-2'>
                {profile.interestedInMilitaryAcademies && (
                  <span className='px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300 rounded-full text-sm font-medium'>
                    Military Academies
                  </span>
                )}
                {profile.interestedInUltraHighAcademics && (
                  <span className='px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-300 rounded-full text-sm font-medium'>
                    Ultra High Academics
                  </span>
                )}
                {profile.interestedInFaithBased && (
                  <span className='px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 rounded-full text-sm font-medium'>
                    Faith-Based
                  </span>
                )}
                {profile.interestedInAllGirls && (
                  <span className='px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-900 dark:text-pink-300 rounded-full text-sm font-medium'>
                    All-Girls Schools
                  </span>
                )}
                {profile.interestedInHBCU && (
                  <span className='px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300 rounded-full text-sm font-medium'>
                    HBCUs
                  </span>
                )}
              </dd>
            </div>
          )}
        </div>
      )}

      {/* Tournament Schedule */}
      {tournamentSchedule && tournamentSchedule.length > 0 && (
        <div>
          <H2 className='text-sm uppercase mb-6'>
            Tournament Schedule
          </H2>
          <div className='space-y-4'>
            {tournamentSchedule.map((t) => {
              if (!t) return null

              return (
                <div
                  key={t.id}
                  className='group relative'
                >
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex-1'>
                      <H3 className='text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                        {t.name}
                      </H3>
                      <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-600 dark:text-slate-300'>
                        <div className='flex items-center gap-1.5'>
                          <Calendar className='w-4 h-4 text-slate-400' />
                          <span>{formatDateRange(t.startDate.toString(), t.endDate.toString())}</span>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <MapPin className='w-4 h-4 text-slate-400' />
                          <span>{t.city}, {t.state}</span>
                        </div>
                      </div>
                    </div>
                    {t.website && (
                      <a
                        href={t.website}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline shrink-0'
                      >
                        Info
                        <ExternalLink className='w-4 h-4' />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Highlight Videos */}
      {profile.highlightVideoUrls && profile.highlightVideoUrls.length > 0 && (
        <div>
          <H2 className='text-sm uppercase mb-6'>
            Highlight Videos
          </H2>
          <div className='grid gap-3'>
            {profile.highlightVideoUrls.map((item: any, index: number) => {
              const url = typeof item === 'object' && item.url ? item.url : item
              if (!url) return null

              return (
                <a
                  key={index}
                  href={url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
                      <Play className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                    </div>
                    <span className='font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                      {getVideoTitle(url, index)}
                    </span>
                  </div>
                  <ExternalLink className='w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors' />
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
