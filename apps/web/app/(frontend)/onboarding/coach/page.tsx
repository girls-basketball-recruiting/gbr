import { CoachOnboardingForm } from '@/components/CoachOnboardingForm'
import { FormPageLayout } from '@/components/ui/FormPageLayout'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function CoachOnboardingPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/register-coach')
  }

  // CRITICAL: Prevent players from accessing coach onboarding
  // This prevents role corruption bugs
  const userRole = user.publicMetadata?.role as string | undefined
  if (userRole && userRole !== 'coach') {
    redirect(`/onboarding/${userRole}`)
  }

  return (
    <FormPageLayout
      title='Complete Your Coach Profile'
      description='Fill out your profile to start discovering talented recruits'
      maxWidth='sm'
    >
      <CoachOnboardingForm
        initialFirstName={user?.firstName || ''}
        initialLastName={user?.lastName || ''}
      />
    </FormPageLayout>
  )
}
