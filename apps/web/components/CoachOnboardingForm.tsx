import { CoachForm } from './CoachForm'

interface CoachOnboardingFormProps {
  initialFirstName?: string
  initialLastName?: string
}

export function CoachOnboardingForm({
  initialFirstName,
  initialLastName,
}: CoachOnboardingFormProps) {
  return <CoachForm mode='create' initialFirstName={initialFirstName} initialLastName={initialLastName} />
}
