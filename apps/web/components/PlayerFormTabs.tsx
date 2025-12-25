'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { FieldError } from '@workspace/ui/components/field'
import { Check, Lock } from 'lucide-react'
import type { Player } from '@/payload-types'

// Step components
import { PlayerBasicInfoStep } from './wizard-steps/PlayerBasicInfoStep'
import { PlayerAAUStep } from './wizard-steps/PlayerAAUStep'
import { PlayerContactStep } from './wizard-steps/PlayerContactStep'
import { PlayerAcademicStep } from './wizard-steps/PlayerAcademicStep'
import { PlayerPreferencesStep } from './wizard-steps/PlayerPreferencesStep'
import { PlayerStatsStep } from './wizard-steps/PlayerStatsStep'

const TABS = [
  { id: 0, label: 'Basic Info', stepNumber: 1 },
  { id: 1, label: 'AAU & Awards', stepNumber: 2 },
  { id: 2, label: 'Contact', stepNumber: 3 },
  { id: 3, label: 'Academic', stepNumber: 4 },
  { id: 4, label: 'Preferences', stepNumber: 5 },
  { id: 5, label: 'Stats & Media', stepNumber: 6 },
] as const

type TabId = (typeof TABS)[number]['id']
type TabState = 'completed' | 'active' | 'unlocked' | 'locked'

interface PlayerFormTabsProps {
  profile?: Player
}

export function PlayerFormTabs({ profile }: PlayerFormTabsProps) {
  const router = useRouter()
  const isEditMode = !!profile

  const [activeTab, setActiveTab] = useState<TabId>(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(!isEditMode)
  const [error, setError] = useState<string | null>(null)
  const [playerData, setPlayerData] = useState<Partial<Player> | null>(
    profile || null
  )

  // Fetch player progress in onboarding mode
  useEffect(() => {
    if (!isEditMode) {
      fetchPlayerProgress()
    }
  }, [isEditMode])

  async function fetchPlayerProgress() {
    try {
      const response = await fetch('/api/players/me')

      if (response.ok) {
        const data = await response.json()
        if (data.player) {
          setPlayerData(data.player)

          // Extract completed step numbers from completedSteps array
          const completed = data.player.completedSteps?.map((s: any) => s.step) || []
          setCompletedSteps(completed)

          // Start on first incomplete step
          const firstIncomplete = findFirstIncompleteStep(completed)
          setActiveTab(firstIncomplete)
        }
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Failed to fetch player progress:', err)
      setIsLoading(false)
    }
  }

  function findFirstIncompleteStep(completed: number[]): TabId {
    for (let i = 0; i < TABS.length; i++) {
      if (!completed.includes(TABS[i]!.stepNumber)) {
        return TABS[i]!.id
      }
    }
    // All steps completed, return last tab
    return TABS[TABS.length - 1]!.id
  }

  function getTabState(tabId: TabId): TabState {
    if (isEditMode) {
      return tabId === activeTab ? 'active' : 'unlocked'
    }

    const stepNumber = TABS[tabId].stepNumber

    if (completedSteps.includes(stepNumber)) return 'completed'
    if (tabId === activeTab) return 'active'

    // Tab is unlocked if all previous steps are completed
    const previousSteps = TABS.filter(t => t.id < tabId).map(t => t.stepNumber)
    const allPreviousCompleted = previousSteps.every(s => completedSteps.includes(s))

    return allPreviousCompleted ? 'unlocked' : 'locked'
  }

  function handleTabClick(tabId: TabId) {
    const state = getTabState(tabId)
    if (state !== 'locked') {
      setActiveTab(tabId)
      setError(null)
    }
  }

  async function handleStepSave(stepData: any) {
    setError(null)
    setIsLoading(true)

    try {
      if (isEditMode && profile) {
        // Edit mode: save all changes to player profile
        await handleProfileUpdate(stepData)
      } else {
        // Onboarding mode: save current step
        await handleOnboardingStepSave(stepData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      setIsLoading(false)
    }
  }

  async function handleOnboardingStepSave(stepData: any) {
    const currentStepNumber = TABS[activeTab].stepNumber

    let response: Response

    // Step 1 sends FormData (includes image upload), others send JSON
    if (stepData instanceof FormData) {
      stepData.append('step', currentStepNumber.toString())
      response = await fetch('/api/players/partial', {
        method: 'POST',
        body: stepData,
      })
    } else {
      response = await fetch('/api/players/partial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: currentStepNumber, data: stepData }),
      })
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save progress')
    }

    // Update completed steps
    setCompletedSteps(data.completedSteps || [])
    setIsLoading(false)

    // Navigate to next tab or complete
    if (activeTab < TABS.length - 1) {
      const nextTab = TABS[activeTab + 1]
      if (nextTab) {
        setActiveTab(nextTab.id as TabId)
      }
    } else {
      // Final step - redirect to dashboard
      window.location.href = '/'
    }
  }

  async function handleProfileUpdate(formData: FormData) {
    if (!profile) return

    const response = await fetch(`/api/players/${profile.id}`, {
      method: 'PUT',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update profile')
    }

    setIsLoading(false)
    router.push('/profile')
    router.refresh()
  }

  function renderStepContent() {
    const stepProps = {
      onSave: handleStepSave,
      error,
      isLastStep: activeTab === TABS.length - 1,
    }

    switch (activeTab) {
      case 0:
        return <PlayerBasicInfoStep {...stepProps} />
      case 1:
        return <PlayerAAUStep {...stepProps} />
      case 2:
        return <PlayerContactStep {...stepProps} />
      case 3:
        return <PlayerAcademicStep {...stepProps} />
      case 4:
        return <PlayerPreferencesStep {...stepProps} />
      case 5:
        return <PlayerStatsStep {...stepProps} />
      default:
        return null
    }
  }

  if (isLoading && !isEditMode) {
    return (
      <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-8'>
        <p className='text-center text-slate-600 dark:text-slate-400'>
          Loading your progress...
        </p>
      </Card>
    )
  }

  return (
    <div className='max-w-3xl mx-auto'>
      <Card className='bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'>
        {/* Tab Navigation */}
        <div className='border-b border-slate-200 dark:border-slate-700'>
          <nav className='flex flex-wrap -mb-px'>
            {TABS.map((tab) => {
              const state = getTabState(tab.id)
              const isActive = state === 'active'
              const isCompleted = state === 'completed'
              const isLocked = state === 'locked'

              return (
                <button
                  key={tab.id}
                  type='button'
                  onClick={() => handleTabClick(tab.id)}
                  disabled={isLocked}
                  className={`
                    px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    flex items-center gap-2
                    ${isActive
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : isCompleted
                        ? 'border-transparent text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600'
                        : isLocked
                          ? 'border-transparent text-slate-400 dark:text-slate-600'
                          : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'
                    }
                    ${isLocked ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  {isCompleted && (
                    <Check className='w-4 h-4 text-green-600 dark:text-green-400' />
                  )}
                  {isLocked && (
                    <Lock className='w-4 h-4' />
                  )}
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className='p-8'>
          {renderStepContent()}
        </div>
      </Card>
    </div>
  )
}
