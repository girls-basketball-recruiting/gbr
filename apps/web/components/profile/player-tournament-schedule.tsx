import type { Tournament } from '@/payload-types';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';

interface PlayerTournamentScheduleProps {
  tournamentSchedule: Tournament[];
}

const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  if (startDate.toDateString() === endDate.toDateString()) {
    return startDate.toLocaleDateString('en-US', options);
  }

  const startFormatted = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const endFormatted = endDate.toLocaleDateString('en-US', options);

  return `${startFormatted} - ${endFormatted}`;
};

export function PlayerTournamentSchedule({ tournamentSchedule }: PlayerTournamentScheduleProps) {
  if (!tournamentSchedule || tournamentSchedule.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className='text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-6'>
        Tournament Schedule
      </h2>
      <div className='space-y-4'>
        {tournamentSchedule.map((t) => {
          if (!t) return null;

          return (
            <div
              key={t.id}
              className='group relative'
            >
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                    {t.name}
                  </h3>
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
          );
        })}
      </div>
    </div>
  );
}
