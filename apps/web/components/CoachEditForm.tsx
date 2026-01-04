import { CoachForm } from './CoachForm'
import { DeleteAccountButton } from './DeleteAccountButton'
import { Card } from '@workspace/ui/components/card'
import { H3 } from './ui/typography/H3'
import { MutedText } from './ui/typography/MutedText'
import type { Coach } from '@/payload-types'

export function CoachEditForm({ profile }: { profile: Coach }) {
  return (
    <div className='space-y-8'>
      <CoachForm profile={profile} mode='edit' />

      {/* Danger Zone */}
      <Card className='p-6'>
        <H3 className='mb-2'>
          Danger Zone
        </H3>
        <MutedText className='text-sm mb-4'>
          Once you delete your account, there is no going back. Please be certain.
        </MutedText>
        <DeleteAccountButton userRole='coach' />
      </Card>
    </div>
  )
}
