import type { Player, Tournament } from '@/payload-types'
import Image from 'next/image'
import { getPositionLabel } from '@/lib/zod/Positions'
import { formatHeight } from '@/lib/formatters'
import { getAAUCircuitLabel } from '@/lib/zod/AauCircuits'
import { getGeographicAreaLabel } from '@/lib/zod/GeographicAreas'
import { getAreaOfStudyLabel } from '@/lib/zod/AreasOfStudy'
import { getDistanceFromHomeLabel } from '@/lib/zod/DistanceFromHome'
import { getLevelOfPlayLabel } from '@/lib/zod/LevelsOfPlay'
import { PlayerTournamentSchedule } from './player-tournament-schedule'
import { PlayerHighlightVideos } from './player-highlight-videos'
import { CopyableText } from './copyable-text'
import { MailIcon, Phone, PhoneIcon } from 'lucide-react'
import { X as XIcon } from 'lucide-react'
import { Instagram } from 'lucide-react'

interface PlayerProfileViewProps {
  player: Player
  tournamentSchedule: Tournament[]
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

export function PlayerProfileView({
  player,
  tournamentSchedule,
}: PlayerProfileViewProps) {
  return (
    <div className='space-y-16 max-w-2xl'>
      {/* Hero Section */}
      <div className='relative'>
        <div className='flex flex-col md:flex-row gap-8 md:gap-12 items-start'>
          {/* Profile Image */}
          {player.profileImageUrl && (
            <div className='w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative shrink-0 shadow-lg'>
              <Image
                src={player.profileImageUrl}
                alt={`${player.firstName} ${player.lastName}`}
                fill
                className='object-cover'
                priority
              />
            </div>
          )}

          {/* Name & Key Info */}
          <div className='flex-1 pt-2'>
            <h1 className='text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight'>
              {player.firstName} {player.lastName}
            </h1>
            <div className='flex flex-wrap items-center gap-3 text-lg text-slate-600 dark:text-slate-300 mb-6'>
              {player.primaryPosition && (
                <>
                  <span className='font-medium'>
                    {getPositionLabel(player.primaryPosition)}
                  </span>
                  {player.secondaryPosition && (
                    <>
                      <span className='text-slate-400'>/</span>
                      <span className='font-medium'>
                        {getPositionLabel(player.secondaryPosition)}
                      </span>
                    </>
                  )}
                  <span className='text-slate-400'>•</span>
                </>
              )}
              <span className='font-semibold'>
                Class of {player.graduationYear}
              </span>
            </div>

            {/* Contact Links */}
            {(player.email ||
              player.phoneNumber ||
              player.xHandle ||
              player.instaHandle) && (
              <div className='flex flex-col gap-2 mb-6'>
                {player.email && (
                  <CopyableText
                    icon={<MailIcon className='w-4 h-4' />}
                    text={player.email}
                    successMsg='Email copied to clipboard!'
                    errorMsg='Failed to copy email'
                  />
                )}
                {player.phoneNumber && (
                  <CopyableText
                    icon={<PhoneIcon className='w-4 h-4' />}
                    text={player.phoneNumber}
                    successMsg='Phone number copied to clipboard!'
                    errorMsg='Failed to copy phone number'
                  />
                )}
                {player.xHandle && (
                  <a
                    href={`https://x.com/${player.xHandle.replace('@', '')}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline'
                  >
                    <XIcon className='w-4 h-4' />@
                    {player.xHandle.replace('@', '')}
                  </a>
                )}
                {player.instaHandle && (
                  <a
                    href={`https://instagram.com/${player.instaHandle.replace('@', '')}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline'
                  >
                    <Instagram className='w-4 h-4' />@
                    {player.instaHandle.replace('@', '')}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {player.bio && (
        <div className='max-w-3xl'>
          <h2 className='text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-4'>
            About
          </h2>
          <p className='text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap'>
            {player.bio}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 py-8 border-y border-slate-200 dark:border-slate-700'>
        <DataPoint
          label='Height'
          value={
            player.heightInInches
              ? formatHeight(player.heightInInches)
              : undefined
          }
        />
        <DataPoint
          label='Weight'
          value={player.weight ? `${player.weight} lbs` : undefined}
        />
        <DataPoint label='PPG' value={player.ppg} />
        <DataPoint label='RPG' value={player.rpg} />
        <DataPoint label='APG' value={player.apg} />
        <DataPoint label='Weighted GPA' value={player.weightedGpa} />
        <DataPoint label='Unweighted GPA' value={player.unweightedGpa} />
        {player.ncaaId && (
          <DataPoint label='NCAA Eligibility ID' value={player.ncaaId} />
        )}
      </div>

      {/* High School & Location */}
      <div>
        <h2 className='text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-4'>
          High School
        </h2>
        <p className='text-2xl font-semibold text-slate-900 dark:text-white mb-2'>
          {player.highSchool}
        </p>
        {(player.city || player.state) && (
          <p className='text-lg text-slate-600 dark:text-slate-300'>
            {player.city}
            {player.city && player.state && ', '}
            {player.state}
          </p>
        )}
      </div>

      {/* AAU Information */}
      {(player.aauProgramName ||
        player.aauTeamName ||
        player.aauCircuit ||
        player.aauCoach) && (
        <div>
          <h2 className='text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-6'>
            AAU Basketball
          </h2>
          <dl className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <DataPoint label='Program' value={player.aauProgramName} />
            <DataPoint label='Team' value={player.aauTeamName} />
            <DataPoint
              label='Circuit'
              value={getAAUCircuitLabel(player.aauCircuit)}
            />
            <DataPoint label='Coach' value={player.aauCoach} />
          </dl>
        </div>
      )}

      {/* Awards */}
      {player.awards && player.awards.length > 0 && (
        <div>
          <h2 className='text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-6'>
            Awards & Achievements
          </h2>
          <div className='space-y-6'>
            {player.awards.map((award: any, index: number) => (
              <div
                key={index}
                className='border-l-2 border-blue-600 dark:border-blue-400 pl-4'
              >
                <div className='flex items-baseline gap-3 mb-1'>
                  <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>
                    {award.title}
                  </h3>
                  {award.year && (
                    <span className='text-sm text-slate-500 dark:text-slate-400'>
                      {award.year}
                    </span>
                  )}
                </div>
                {award.description && (
                  <p className='text-slate-600 dark:text-slate-300'>
                    {award.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* College Preferences */}
      <div>
        <h2 className='text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-6'>
          College Preferences
        </h2>
        <dl className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {player.desiredLevelsOfPlay &&
            player.desiredLevelsOfPlay.length > 0 && (
              <div>
                <dt className='text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-2'>
                  Desired Levels
                </dt>
                <dd className='flex flex-wrap gap-2'>
                  {player.desiredLevelsOfPlay.map((level: string) => (
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
          {player.desiredGeographicAreas &&
            player.desiredGeographicAreas.length > 0 && (
              <div>
                <dt className='text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-2'>
                  Geographic Preferences
                </dt>
                <dd className='flex flex-wrap gap-2'>
                  {player.desiredGeographicAreas.map((area: string) => (
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
          {player.desiredDistanceFromHome && (
            <DataPoint
              label='Desired Distance from Home'
              value={getDistanceFromHomeLabel(player.desiredDistanceFromHome)}
            />
          )}
          {player.potentialAreasOfStudy &&
            player.potentialAreasOfStudy.length > 0 && (
              <div>
                <dt className='text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-2'>
                  Areas of Study
                </dt>
                <dd className='flex flex-wrap gap-2'>
                  {player.potentialAreasOfStudy.map((area: string) => (
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
        {(player.interestedInMilitaryAcademies ||
          player.interestedInUltraHighAcademics ||
          player.interestedInFaithBased ||
          player.interestedInAllGirls ||
          player.interestedInHBCU) && (
          <div className='mt-6'>
            <dt className='text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-2'>
              Special Interests
            </dt>
            <dd className='flex flex-wrap gap-2'>
              {player.interestedInMilitaryAcademies && (
                <span className='px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300 rounded-full text-sm font-medium'>
                  Military Academies
                </span>
              )}
              {player.interestedInUltraHighAcademics && (
                <span className='px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-300 rounded-full text-sm font-medium'>
                  Ultra High Academics
                </span>
              )}
              {player.interestedInFaithBased && (
                <span className='px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 rounded-full text-sm font-medium'>
                  Faith-Based
                </span>
              )}
              {player.interestedInAllGirls && (
                <span className='px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-900 dark:text-pink-300 rounded-full text-sm font-medium'>
                  All-Girls Schools
                </span>
              )}
              {player.interestedInHBCU && (
                <span className='px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300 rounded-full text-sm font-medium'>
                  HBCUs
                </span>
              )}
            </dd>
          </div>
        )}
      </div>

      {/* Tournament Schedule */}
      <PlayerTournamentSchedule tournamentSchedule={tournamentSchedule} />

      {/* Highlight Videos */}
      <PlayerHighlightVideos player={player} />
    </div>
  )
}
