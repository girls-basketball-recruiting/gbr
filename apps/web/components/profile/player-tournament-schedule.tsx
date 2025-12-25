import { Card } from '@workspace/ui/components/card';
import type { Tournament } from '@/payload-types';

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
    <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6 mb-8'>
      <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
        Tournament Schedule
      </h2>
      <div className='space-y-3'>
        {tournamentSchedule.map((t) => {
          if (!t) return null;

          return (
            <div
              key={t.id}
              className='flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600'
            >
              <div>
                <h3 className='font-semibold text-slate-900 dark:text-white'>{t.name}</h3>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  {formatDateRange(t.startDate.toString(), t.endDate.toString())} • {t.city}, {t.state}
                </p>
              </div>
              {t.website && (
                <a
                  href={t.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm'
                >
                  View Details →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
