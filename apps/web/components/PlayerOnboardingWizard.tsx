'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormStepper } from './ui/FormStepper'
import { PlayerBasicInfoStep } from './wizard-steps/PlayerBasicInfoStep'
import { PlayerAAUStep } from './wizard-steps/PlayerAAUStep'
import { PlayerContactStep } from './wizard-steps/PlayerContactStep'
import { PlayerAcademicStep } from './wizard-steps/PlayerAcademicStep'
import { PlayerPreferencesStep } from './wizard-steps/PlayerPreferencesStep'
import { PlayerStatsStep } from './wizard-steps/PlayerStatsStep'

const STEPS = [
  { id: 1, name: 'Basic Info', description: 'Your profile essentials' },
  { id: 2, name: 'AAU & Awards', description: 'Team and achievements' },
  { id: 3, name: 'Contact', description: 'Get connected' },
  { id: 4, name: 'Academic', description: 'Grades and interests' },
  { id: 5, name: 'Preferences', description: 'College preferences' },
  { id: 6, name: 'Stats & Media', description: 'Showcase your game' },
]

export function PlayerOnboardingWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stepParam = searchParams.get('step')
  const currentStep = stepParam ? parseInt(stepParam) : 1

  const [error, setError] = useState<string | null>(null)

  // Redirect to step 1 if invalid step
  useEffect(() => {
    if (currentStep < 1 || currentStep > STEPS.length) {
      router.push('/onboarding/player?step=1')
    }
  }, [currentStep, router])

  const goToStep = (step: number) => {
    router.push(`/onboarding/player?step=${step}`)
  }

  const handleStepComplete = async (stepData: any) => {
    setError(null)

    try {
      let response: Response

      // Step 1 sends FormData (includes image upload), others send JSON
      if (stepData instanceof FormData) {
        // Step 1 - FormData with image
        stepData.append('step', currentStep.toString())
        response = await fetch('/api/players/partial', {
          method: 'POST',
          body: stepData,
        })
      } else {
        // Steps 2-6 - JSON data
        response = await fetch('/api/players/partial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: currentStep, data: stepData }),
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save progress')
      }

      // Move to next step or complete
      if (currentStep < STEPS.length) {
        goToStep(currentStep + 1)
      } else {
        // Final step - redirect to dashboard
        window.location.href = '/'
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save progress')
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    const stepProps = {
      onNext: handleStepComplete,
      onBack: handleBack,
      isFirstStep: currentStep === 1,
      isLastStep: currentStep === STEPS.length,
      error,
    }

    switch (currentStep) {
      case 1:
        return (
          <PlayerBasicInfoStep {...stepProps} />
        )
      case 2:
        return <PlayerAAUStep {...stepProps} />
      case 3:
        return <PlayerContactStep {...stepProps} />
      case 4:
        return <PlayerAcademicStep {...stepProps} />
      case 5:
        return <PlayerPreferencesStep {...stepProps} />
      case 6:
        return <PlayerStatsStep {...stepProps} />
      default:
        return null
    }
  }

  return (
    <div className='max-w-3xl mx-auto'>
      <FormStepper steps={STEPS} currentStep={currentStep} />
      <div className='mt-8'>{renderStep()}</div>
    </div>
  )
}
