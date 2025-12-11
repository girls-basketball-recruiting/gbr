import { PlayerForm } from './PlayerForm'
import type { Player } from '@/payload-types'

export function PlayerEditForm({ profile }: { profile: Player }) {
  return <PlayerForm profile={profile} mode='edit' />
}
