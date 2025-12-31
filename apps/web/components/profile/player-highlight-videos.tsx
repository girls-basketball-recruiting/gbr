import type { Player } from '@/payload-types';
import { Play, ExternalLink } from 'lucide-react';

interface PlayerHighlightVideosProps {
  player: Player;
}

function getVideoTitle(url: string, index: number): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return `YouTube Highlight ${index + 1}`;
  }
  if (url.includes('hudl.com')) {
    return `Hudl Highlight ${index + 1}`;
  }
  return `Highlight Video ${index + 1}`;
}

export function PlayerHighlightVideos({ player }: PlayerHighlightVideosProps) {
  if (!player.highlightVideoUrls || player.highlightVideoUrls.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className='text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mb-6'>
        Highlight Videos
      </h2>
      <div className='grid gap-3'>
        {player.highlightVideoUrls.map((item: any, index: number) => {
          const url = typeof item === 'object' && item.url ? item.url : item;
          if (!url) return null;

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
          );
        })}
      </div>
    </div>
  );
}
