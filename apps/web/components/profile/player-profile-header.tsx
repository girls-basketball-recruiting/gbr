import Image from 'next/image';
import { Card } from '@workspace/ui/components/card';
import type { Player } from '@/payload-types';

interface PlayerProfileHeaderProps {
  player: Player;
}

export function PlayerProfileHeader({ player }: PlayerProfileHeaderProps) {
  return (
    <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-8 mb-8'>
      <div className='flex items-start gap-6'>
        {/* Profile Image */}
        {player.profileImageUrl && (
          <div className='w-24 h-24 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 relative flex-shrink-0'>
            <Image
              src={player.profileImageUrl}
              alt={`${player.firstName} ${player.lastName}`}
              fill
              className='object-cover'
            />
          </div>
        )}

        {/* Player Info */}
        <div>
          <h1 className='text-4xl font-bold text-slate-900 dark:text-white mb-2'>
            {player.firstName} {player.lastName}
          </h1>
          <p className='text-xl text-slate-600 dark:text-slate-400'>
            Class of {player.graduationYear}
          </p>
        </div>
      </div>
    </Card>
  );
}
