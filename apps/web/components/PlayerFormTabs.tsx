'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@workspace/ui/components/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@workspace/ui/components/tabs'
import { Check, Lock } from 'lucide-react'
import type { Player } from '@/payload-types'

// Step components
import { PlayerBasicInfoStep } from './wizard-steps/PlayerBasicInfoStep'
import { PlayerAthleticProfileStep } from './wizard-steps/PlayerAthleticProfileStep'
import { PlayerAcademicProfileStep } from './wizard-steps/PlayerAcademicProfileStep'

const TABS = [
  { id: 0, label: 'Basic Info', stepNumber: 1 },
  { id: 1, label: 'Athletic Profile', stepNumber: 2 },
  { id: 2, label: 'Academic Profile', stepNumber: 3 },
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

  function handleTabChange(value: string) {
    const tabId = parseInt(value) as TabId
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

    const response = await fetch(`/api/players/${profile.id}/details`, {
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

  if (isLoading && !isEditMode) {
    return (
      <Card className='p-8'>
        <p className='text-center'>
          Loading your progress...
        </p>
      </Card>
    )
  }

  const stepProps = {
    onSave: handleStepSave,
    error,
    isLastStep: activeTab === TABS.length - 1,
    profile: playerData,
  }

  return (
    <div className='max-w-lg mx-auto'>
      <Card className='py-0 overflow-hidden'>
        <Tabs value={activeTab.toString()} onValueChange={handleTabChange}>
          <TabsList className='w-full h-auto rounded-none border-b p-0'>
            {TABS.map((tab) => {
              const state = getTabState(tab.id)
              const isCompleted = state === 'completed'
              const isLocked = state === 'locked'

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id.toString()}
                  disabled={isLocked}
                  className='flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap rounded-none border-none'
                >
                  {isCompleted && (
                    <Check className='w-4 h-4' />
                  )}
                  {isLocked && (
                    <Lock className='w-4 h-4' />
                  )}
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <div className='p-8'>
            <TabsContent value='0'>
              <PlayerBasicInfoStep {...stepProps} />
            </TabsContent>
            <TabsContent value='1'>
              <PlayerAthleticProfileStep {...stepProps} />
            </TabsContent>
            <TabsContent value='2'>
              <PlayerAcademicProfileStep {...stepProps} />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}
