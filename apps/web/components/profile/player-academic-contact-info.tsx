import { Card } from '@workspace/ui/components/card';
import type { Player } from '@/payload-types';

interface PlayerAcademicContactInfoProps {
  player: Player;
}

export function PlayerAcademicContactInfo({ player }: PlayerAcademicContactInfoProps) {
  return (
    <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6'>
      <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
        Academic & Contact
      </h2>
      <div className='space-y-3 text-slate-700 dark:text-slate-300'>
        {player.highSchool && (
          <div>
            <span className='text-slate-600 dark:text-slate-400'>High School:</span>{' '}
            <span className='font-medium'>{player.highSchool}</span>
          </div>
        )}
        {(player.city || player.state) && (
          <div>
            <span className='text-slate-600 dark:text-slate-400'>Location:</span>{' '}
            <span className='font-medium'>
              {player.city}
              {player.city && player.state && ', '}
              {player.state}
            </span>
          </div>
        )}
        {player.weightedGpa && (
          <div>
            <span className='text-slate-600 dark:text-slate-400'>Weighted GPA:</span>{' '}
            <span className='font-medium'>{player.weightedGpa}</span>
          </div>
        )}
        {player.unweightedGpa && (
          <div>
            <span className='text-slate-600 dark:text-slate-400'>Unweighted GPA:</span>{' '}
            <span className='font-medium'>{player.unweightedGpa}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
