import { CoachForm } from './CoachForm'
import type { Coach } from '@/payload-types'

export function CoachEditForm({ profile }: { profile: Coach }) {
  return <CoachForm profile={profile} mode='edit' />
}
