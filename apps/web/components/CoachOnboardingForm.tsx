import { CoachForm } from './CoachForm'

interface CoachOnboardingFormProps {
  initialName?: string
}

export function CoachOnboardingForm({
  initialName,
}: CoachOnboardingFormProps) {
  return <CoachForm mode='create' initialName={initialName} />
}
