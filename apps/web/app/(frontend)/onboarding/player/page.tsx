import { PlayerOnboardingForm } from '@/components/PlayerOnboardingForm'
import { FormPageLayout } from '@/components/ui/FormPageLayout'

export default function PlayerOnboardingPage() {
  return (
    <FormPageLayout
      title='Complete Your Player Profile'
      description='Fill out your profile to start connecting with college coaches'
      maxWidth='sm'
    >
      <PlayerOnboardingForm />
    </FormPageLayout>
  )
}
