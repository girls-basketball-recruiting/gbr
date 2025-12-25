import { Card } from '@workspace/ui/components/card';
import type { Player } from '@/payload-types';

interface PlayerHighlightVideosProps {
  player: Player;
}

export function PlayerHighlightVideos({ player }: PlayerHighlightVideosProps) {
  if (!player.highlightVideoUrls || player.highlightVideoUrls.length === 0) {
    return null;
  }

  return (
    <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-6'>
      <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-4'>
        Highlight Videos
      </h2>
      <div className='space-y-2'>
        {player.highlightVideoUrls.map((item: any, index: number) => {
          const url = typeof item === 'object' && item.url ? item.url : item;
          return url ? (
            <div key={index}>
              <a
                href={url}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline block'
              >
                {url}
              </a>
            </div>
          ) : null;
        })}
      </div>
    </Card>
  );
}
