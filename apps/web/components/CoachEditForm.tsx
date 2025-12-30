import { CoachForm } from './CoachForm'
import { DeleteAccountButton } from './DeleteAccountButton'
import { Card } from '@workspace/ui/components/card'
import type { Coach } from '@/payload-types'

export function CoachEditForm({ profile }: { profile: Coach }) {
  return (
    <div className='space-y-8'>
      <CoachForm profile={profile} mode='edit' />

      {/* Danger Zone */}
      <Card className='bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 p-6'>
        <h3 className='text-lg font-semibold text-red-900 dark:text-red-400 mb-2'>
          Danger Zone
        </h3>
        <p className='text-sm text-red-700 dark:text-red-400/80 mb-4'>
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <DeleteAccountButton userRole='coach' />
      </Card>
    </div>
  )
}
