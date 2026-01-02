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
  // Check publicMetadata first (after webhook processes), then unsafeMetadata (during race condition)
  const userRole = (user.publicMetadata?.role || user.unsafeMetadata?.role) as string | undefined
  if (userRole && userRole !== 'coach') {
    redirect(`/onboarding/${userRole}`)
  }

  return (
    <FormPageLayout
      title={`You're in, Coach ${user.lastName}`}
      description='Fill out your Coach profile to start discovering talented recruits'
      maxWidth='md'
    >
      <CoachOnboardingForm
        initialFirstName={user?.firstName || ''}
        initialLastName={user?.lastName || ''}
      />
    </FormPageLayout>
  )
}
