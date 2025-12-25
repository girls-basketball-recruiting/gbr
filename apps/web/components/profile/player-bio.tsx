import { Card } from '@workspace/ui/components/card';
import type { Player } from '@/payload-types';

interface PlayerBioProps {
  player: Player;
}

export function PlayerBio({ player }: PlayerBioProps) {
  if (!player.bio) {
    return null;
  }

  return (
    <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6 mb-8'>
      <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>About</h2>
      <p className='text-slate-700 dark:text-slate-300 whitespace-pre-wrap'>{player.bio}</p>
    </Card>
  );
}
