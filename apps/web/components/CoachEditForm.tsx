import { CoachForm } from './CoachForm'
import type { Coach } from '@/payload-types'

export function CoachEditForm({ profile }: { profile: Coach }) {
  return (
    <div className='space-y-8'>
      <CoachForm profile={profile} mode='edit' />
    </div>
  )
}
