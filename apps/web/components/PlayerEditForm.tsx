import { PlayerFormTabs } from './PlayerFormTabs'
import type { Player } from '@/payload-types'

export function PlayerEditForm({ profile }: { profile: Player }) {
  return (
    <div className='space-y-8'>
      <PlayerFormTabs profile={profile} />
    </div>
  )
}
