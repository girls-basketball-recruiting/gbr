import { PlayerFormTabs } from '@/components/PlayerFormTabs'
import { FormPageLayout } from '@/components/ui/FormPageLayout'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function PlayerOnboardingPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/register-player')
  }

  // CRITICAL: Prevent coaches from accessing player onboarding
  // This prevents role corruption bugs
  // Check publicMetadata first (after webhook processes), then unsafeMetadata (during race condition)
  const userRole = (user.publicMetadata?.role || user.unsafeMetadata?.role) as string | undefined
  if (userRole && userRole !== 'player') {
    redirect(`/onboarding/${userRole}`)
  }

  return (
    <FormPageLayout
      title={`You're in, ${user.firstName}!`}
      description='Complete your player profile to connect with college programs'
      maxWidth='lg'
    >
      <PlayerFormTabs
        initialFirstName={user.firstName || ''}
        initialLastName={user.lastName || ''}
        initialEmail={user.emailAddresses[0]?.emailAddress || ''}
      />
    </FormPageLayout>
  )
}
