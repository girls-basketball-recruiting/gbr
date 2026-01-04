import { PlayerFormTabs } from './PlayerFormTabs'
import { DeleteAccountButton } from './DeleteAccountButton'
import { Card } from '@workspace/ui/components/card'
import { H3 } from './ui/typography/H3'
import { MutedText } from './ui/typography/MutedText'
import type { Player } from '@/payload-types'

export function PlayerEditForm({ profile }: { profile: Player }) {
  return (
    <div className='space-y-8'>
      <PlayerFormTabs profile={profile} />

      {/* Danger Zone */}
      <div className='max-w-lg mx-auto'>
        <Card className='p-6'>
          <H3 className='mb-2'>
            Danger Zone
          </H3>
          <MutedText className='text-sm mb-4'>
            Once you delete your account, there is no going back. Please be certain.
          </MutedText>
          <DeleteAccountButton userRole='player' />
        </Card>
      </div>
    </div>
  )
}
