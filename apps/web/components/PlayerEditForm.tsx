import { PlayerEditTabs } from './PlayerEditTabs'
import type { Player } from '@/payload-types'

export function PlayerEditForm({ profile }: { profile: Player }) {
  return <PlayerEditTabs profile={profile} />
}
