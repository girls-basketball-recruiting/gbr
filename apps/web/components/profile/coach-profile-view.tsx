import type { Coach } from '@/payload-types';
import Image from 'next/image';
import { getCoachPositionLabel } from '@/lib/zod/CoachPositions';
import { Mail, Phone } from 'lucide-react';

interface CoachProfileViewProps {
  coach: Coach;
}

function DataPoint({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className='text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-1'>
        {label}
      </dt>
      <dd className='text-base text-slate-900 dark:text-white font-medium'>
        {value}
      </dd>
    </div>
  );
}

export function CoachProfileView({ coach }: CoachProfileViewProps) {
  return (
    <div className='space-y-16 max-w-2xl'>
      {/* Hero Section */}
      <div className='relative'>
        <div className='flex flex-col md:flex-row gap-8 md:gap-12 items-start'>
          {/* Profile Image */}
          {coach.profileImageUrl && (
            <div className='w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative flex-shrink-0 shadow-lg'>
              <Image
                src={coach.profileImageUrl}
                alt={`${coach.firstName} ${coach.lastName}`}
                fill
                className='object-cover'
                priority
              />
            </div>
          )}

          {/* Name & Key Info */}
          <div className='flex-1 pt-2'>
            <h1 className='text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight'>
              {coach.firstName} {coach.lastName}
            </h1>
            <div className='flex flex-wrap items-center gap-3 text-lg text-slate-600 dark:text-slate-300 mb-4'>
              {coach.jobTitle && (
                <>
                  <span className='font-medium'>{getCoachPositionLabel(coach.jobTitle)}</span>
                  <span className='text-slate-400'>•</span>
                </>
              )}
              <span className='font-semibold text-blue-600 dark:text-blue-400'>{coach.collegeName}</span>
            </div>

            {/* Location */}
            {(coach.city || coach.state) && (
              <p className='text-base text-slate-600 dark:text-slate-400 mb-6'>
                {coach.city}{coach.city && coach.state && ', '}{coach.state}
              </p>
            )}

            {/* Contact Links */}
            {(coach.email || coach.phone) && (
              <div className='flex flex-wrap gap-4'>
                {coach.email && (
                  <a
                    href={`mailto:${coach.email}`}
                    className='inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline'
                  >
                    <Mail className='w-4 h-4' />
                    Email
                  </a>
                )}
                {coach.phone && (
                  <a
                    href={`tel:${coach.phone}`}
                    className='inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline'
                  >
                    <Phone className='w-4 h-4' />
                    Phone
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {coach.bio && (
        <div className='max-w-3xl'>
          <h2 className='text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-4'>
            About Our Program
          </h2>
          <p className='text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap'>
            {coach.bio}
          </p>
        </div>
      )}

      {/* Program Information */}
      <div>
        <h2 className='text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-6'>
          Program Information
        </h2>
        <dl className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <DataPoint label='College' value={coach.collegeName} />
          <DataPoint label='Position' value={getCoachPositionLabel(coach.jobTitle)} />
          {coach.city && coach.state && (
            <DataPoint label='Location' value={`${coach.city}, ${coach.state}`} />
          )}
        </dl>
      </div>
    </div>
  );
}
