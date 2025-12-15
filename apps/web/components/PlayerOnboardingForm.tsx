import { PlayerForm } from './PlayerForm'

interface PlayerOnboardingFormProps {
  initialFirstName?: string
  initialLastName?: string
}

export function PlayerOnboardingForm({
  initialFirstName,
  initialLastName,
}: PlayerOnboardingFormProps) {
  return (
    <PlayerForm
      mode='create'
      initialFirstName={initialFirstName}
      initialLastName={initialLastName}
    />
  )
}
