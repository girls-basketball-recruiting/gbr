import { CoachOnboardingForm } from '@/components/CoachOnboardingForm'
import { FormPageLayout } from '@/components/ui/FormPageLayout'
import { currentUser } from '@clerk/nextjs/server'

export default async function CoachOnboardingPage() {
  const user = await currentUser()

  return (
    <FormPageLayout
      title='Complete Your Coach Profile'
      description='Fill out your profile to start discovering talented recruits'
      maxWidth='sm'
    >
      <CoachOnboardingForm
        initialName={user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
      />
    </FormPageLayout>
  )
}
