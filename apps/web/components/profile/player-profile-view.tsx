import type { Player, Tournament } from '@/payload-types';
import { PlayerProfileHeader } from './player-profile-header';
import { PlayerAthleticInfo } from './player-athletic-info';
import { PlayerAcademicContactInfo } from './player-academic-contact-info';
import { PlayerBio } from './player-bio';
import { PlayerTournamentSchedule } from './player-tournament-schedule';
import { PlayerHighlightVideos } from './player-highlight-videos';

interface PlayerProfileViewProps {
  player: Player;
  tournamentSchedule: Tournament[];
}

export function PlayerProfileView({ player, tournamentSchedule }: PlayerProfileViewProps) {
  return (
    <>
      <PlayerProfileHeader player={player} />

      <div className='grid md:grid-cols-2 gap-8 mb-8'>
        <PlayerAthleticInfo player={player} />
        <PlayerAcademicContactInfo player={player} />
      </div>

      <PlayerBio player={player} />
      <PlayerTournamentSchedule tournamentSchedule={tournamentSchedule} />
      <PlayerHighlightVideos player={player} />
    </>
  );
}
