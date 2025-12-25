import { PlayerFormTabs } from './PlayerFormTabs'
import type { Player } from '@/payload-types'

export function PlayerEditForm({ profile }: { profile: Player }) {
  return <PlayerFormTabs profile={profile} />
}
