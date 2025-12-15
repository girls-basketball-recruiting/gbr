import { PlayerOnboardingForm } from '@/components/PlayerOnboardingForm'
import { FormPageLayout } from '@/components/ui/FormPageLayout'
import { currentUser } from '@clerk/nextjs/server'

export default async function PlayerOnboardingPage() {
  const user = await currentUser()

  return (
    <FormPageLayout
      title='Complete Your Player Profile'
      description='Fill out your profile to start connecting with college coaches'
      maxWidth='sm'
    >
      <PlayerOnboardingForm
        initialFirstName={user?.firstName || ''}
        initialLastName={user?.lastName || ''}
      />
    </FormPageLayout>
  )
}
