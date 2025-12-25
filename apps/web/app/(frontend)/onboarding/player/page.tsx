import { PlayerOnboardingWizard } from '@/components/PlayerOnboardingWizard'
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
  const userRole = user.publicMetadata?.role as string | undefined
  if (userRole && userRole !== 'player') {
    redirect(`/onboarding/${userRole}`)
  }

  return (
    <FormPageLayout
      title='Complete Your Player Profile'
      description='Follow the steps below to build your profile and connect with college coaches'
      maxWidth='lg'
    >
      <PlayerOnboardingWizard />
    </FormPageLayout>
  )
}
