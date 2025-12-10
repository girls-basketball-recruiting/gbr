import { CoachOnboardingForm } from '@/components/CoachOnboardingForm'
import { FormPageLayout } from '@/components/ui/FormPageLayout'

export default function CoachOnboardingPage() {
  return (
    <FormPageLayout
      title='Complete Your Coach Profile'
      description='Fill out your profile to start discovering talented recruits'
      maxWidth='sm'
    >
      <CoachOnboardingForm />
    </FormPageLayout>
  )
}
