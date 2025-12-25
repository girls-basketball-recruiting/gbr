import { Card } from '@workspace/ui/components/card';
import { getPositionLabel } from '@/lib/zod/Positions';
import { formatHeight } from '@/lib/formatters';
import type { Player } from '@/payload-types';

interface PlayerAthleticInfoProps {
  player: Player;
}

export function PlayerAthleticInfo({ player }: PlayerAthleticInfoProps) {
  return (
    <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6'>
      <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
        Athletic Info
      </h2>
      <div className='space-y-3 text-slate-700 dark:text-slate-300'>
        {player.primaryPosition && (
          <div>
            <span className='text-slate-600 dark:text-slate-400'>Primary Position:</span>{' '}
            <span className='font-medium'>
              {getPositionLabel(player.primaryPosition)}
            </span>
          </div>
        )}
        {player.secondaryPosition && (
          <div>
            <span className='text-slate-600 dark:text-slate-400'>Secondary Position:</span>{' '}
            <span className='font-medium'>
              {getPositionLabel(player.secondaryPosition)}
            </span>
          </div>
        )}
        {player.heightInInches && (
          <div>
            <span className='text-slate-600 dark:text-slate-400'>Height:</span>{' '}
            <span className='font-medium'>{formatHeight(player.heightInInches)}</span>
          </div>
        )}
        {player.weight && (
          <div>
            <span className='text-slate-600 dark:text-slate-400'>Weight:</span>{' '}
            <span className='font-medium'>{player.weight} lbs</span>
          </div>
        )}
      </div>
    </Card>
  );
}
