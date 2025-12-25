# Player Form Tabs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace stepper-based onboarding with unified tab-based component for both onboarding and profile editing

**Architecture:** Single PlayerFormTabs component that handles both modes (onboarding vs edit) based on presence of profile prop. In onboarding mode, tabs unlock sequentially after each save with progress tracked via completedSteps array. In edit mode, all tabs are accessible.

**Tech Stack:** Next.js 15, React, TypeScript, PayloadCMS, Clerk Auth

---

## Task 1: Add completedSteps Field to Player Model

**Files:**
- Modify: `apps/web/collections/Players.ts:356` (add before closing fields array)

**Step 1: Add completedSteps field to Player collection**

Add this field after the `deletedAt` field and before the closing of the fields array:

```typescript
{
  name: 'completedSteps',
  type: 'array',
  fields: [
    {
      name: 'step',
      type: 'number',
      required: true,
    },
  ],
  admin: {
    description: 'Tracks which onboarding steps have been completed (1-6)',
    readOnly: true,
  },
},
```

**Step 2: Regenerate Payload types**

Run: `cd apps/web && pnpm run payload generate:types`
Expected: Types regenerated successfully, payload-types.ts updated

**Step 3: Commit**

```bash
git add apps/web/collections/Players.ts apps/web/payload-types.ts
git commit -m "feat: add completedSteps field to Player model"
```

---

## Task 2: Update Partial Route to Track Completed Steps

**Files:**
- Modify: `apps/web/app/(frontend)/api/players/partial/route.ts:226-245`

**Step 1: Add completedSteps logic before create/update**

Replace the section from line 226 (after the switch statement) to line 245 (before the return) with:

```typescript
// Ensure user has 'player' role in Clerk (only on step 1)
if (step === 1 && !existingPlayer) {
  const client = await clerkClient()
  await client.users.updateUserMetadata(clerkUser.id, {
    publicMetadata: {
      role: 'player',
    },
  })
}

// Track completed steps
const existingCompletedSteps = existingPlayer?.completedSteps || []
const completedStepNumbers = existingCompletedSteps.map((s: any) => s.step)

// Add current step to completedSteps if not already there
if (!completedStepNumbers.includes(step)) {
  updateData.completedSteps = [...existingCompletedSteps, { step }]
}

// Create or update player profile
let player
if (existingPlayer) {
  player = await updateById('players', existingPlayer.id, updateData)
} else {
  player = await create('players', updateData)
}

// Return completedSteps array for frontend
const updatedCompletedSteps = player.completedSteps?.map((s: any) => s.step) || []

return apiSuccess(
  { player, completedSteps: updatedCompletedSteps },
  existingPlayer ? 200 : 201
)
```

**Step 2: Test the endpoint manually**

Run dev server: `pnpm run dev`
Test with curl (as authenticated user):
```bash
curl -X POST http://localhost:3000/api/players/partial \
  -H "Content-Type: application/json" \
  -d '{"step": 1, "data": {"graduationYear": "2025"}}'
```
Expected: Returns `{ player: {...}, completedSteps: [1] }`

**Step 3: Commit**

```bash
git add apps/web/app/(frontend)/api/players/partial/route.ts
git commit -m "feat: track completedSteps in partial player update"
```

---

## Task 3: Create Unified PlayerFormTabs Component

**Files:**
- Create: `apps/web/components/PlayerFormTabs.tsx`

**Step 1: Create component file with basic structure**

```typescript
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

  // TODO: Add useEffect for fetching player progress in onboarding mode
  // TODO: Add getTabState function
  // TODO: Add handleTabClick function
  // TODO: Add handleStepSave function
  // TODO: Add renderStepContent function
  // TODO: Add render logic

  return <div>PlayerFormTabs - TODO</div>
}
```

**Step 2: Add initialization logic**

Add this useEffect after state declarations:

```typescript
// Fetch player progress in onboarding mode
useEffect(() => {
  if (!isEditMode) {
    fetchPlayerProgress()
  }
}, [isEditMode])

async function fetchPlayerProgress() {
  try {
    const response = await fetch('/api/players')

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
    if (!completed.includes(TABS[i].stepNumber)) {
      return TABS[i].id
    }
  }
  // All steps completed, return last tab
  return TABS[TABS.length - 1].id
}
```

**Step 3: Add tab state logic**

Add these functions after the initialization logic:

```typescript
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
```

**Step 4: Commit progress**

```bash
git add apps/web/components/PlayerFormTabs.tsx
git commit -m "feat: add PlayerFormTabs component structure and tab state logic"
```

---

## Task 4: Add Save Handlers to PlayerFormTabs

**Files:**
- Modify: `apps/web/components/PlayerFormTabs.tsx` (add save handlers)

**Step 1: Add save handlers for both modes**

Add these functions after the tab state logic:

```typescript
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
    setActiveTab((TABS[activeTab + 1].id) as TabId)
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
```

**Step 2: Commit**

```bash
git add apps/web/components/PlayerFormTabs.tsx
git commit -m "feat: add save handlers for onboarding and edit modes"
```

---

## Task 5: Add Render Logic to PlayerFormTabs

**Files:**
- Modify: `apps/web/components/PlayerFormTabs.tsx` (add render functions and JSX)

**Step 1: Add render step content function**

Add this function after the save handlers:

```typescript
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
```

**Step 2: Replace placeholder return with full UI**

Replace the `return <div>PlayerFormTabs - TODO</div>` with:

```typescript
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
```

**Step 3: Commit**

```bash
git add apps/web/components/PlayerFormTabs.tsx
git commit -m "feat: add tab navigation UI and content rendering"
```

---

## Task 6: Update Wizard Step Components - Remove Back Button

**Files:**
- Modify: `apps/web/components/wizard-steps/PlayerBasicInfoStep.tsx`
- Modify: `apps/web/components/wizard-steps/PlayerAAUStep.tsx`
- Modify: `apps/web/components/wizard-steps/PlayerContactStep.tsx`
- Modify: `apps/web/components/wizard-steps/PlayerAcademicStep.tsx`
- Modify: `apps/web/components/wizard-steps/PlayerPreferencesStep.tsx`
- Modify: `apps/web/components/wizard-steps/PlayerStatsStep.tsx`

**Step 1: Update PlayerBasicInfoStep props**

In `PlayerBasicInfoStep.tsx`, replace the interface (lines 16-20):

```typescript
interface PlayerBasicInfoStepProps {
  onSave: (data: any) => Promise<void>
  error: string | null
  isLastStep: boolean
}
```

Update the component signature and destructuring (line 22-25):

```typescript
export function PlayerBasicInfoStep({
  onSave,
  error,
  isLastStep,
}: PlayerBasicInfoStepProps) {
```

Change `onNext` to `onSave` in the handleSubmit call (line 73):

```typescript
await onSave(formDataToSend)
```

**Step 2: Remove Back button and update Continue button**

In the navigation section (lines 252-256), replace with:

```typescript
<div className='flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700'>
  <Button type='submit' disabled={isSubmitting} className='bg-blue-600 hover:bg-blue-700'>
    {isSubmitting ? 'Saving...' : isLastStep ? 'Complete Profile' : 'Save & Continue'}
  </Button>
</div>
```

**Step 3: Commit PlayerBasicInfoStep**

```bash
git add apps/web/components/wizard-steps/PlayerBasicInfoStep.tsx
git commit -m "refactor: update PlayerBasicInfoStep for tab navigation"
```

**Step 4: Update remaining step components**

For each of the remaining 5 step components, make the same changes:
1. Update props interface to use `onSave` instead of `onNext`, remove `onBack` and `isFirstStep`
2. Update component destructuring
3. Change `onNext` calls to `onSave`
4. Remove Back button, update Continue button text logic

**Step 5: Commit remaining steps**

```bash
git add apps/web/components/wizard-steps/*.tsx
git commit -m "refactor: update all wizard step components for tab navigation"
```

---

## Task 7: Update Onboarding Page

**Files:**
- Modify: `apps/web/app/(frontend)/onboarding/player/page.tsx`

**Step 1: Replace PlayerOnboardingWizard with PlayerFormTabs**

Replace the import (line 1):

```typescript
import { PlayerFormTabs } from '@/components/PlayerFormTabs'
```

Replace the component usage (line 26):

```typescript
<PlayerFormTabs />
```

**Step 2: Test onboarding flow**

Run dev server: `pnpm run dev`
Navigate to: `http://localhost:3000/onboarding/player`
Test:
1. Tab 1 active, others locked
2. Fill Basic Info, click "Save & Continue"
3. Tab 1 shows checkmark, Tab 2 becomes active
4. Can click back to Tab 1
5. Tab 3 still locked

Expected: Sequential unlocking works correctly

**Step 3: Commit**

```bash
git add apps/web/app/(frontend)/onboarding/player/page.tsx
git commit -m "refactor: use PlayerFormTabs in onboarding page"
```

---

## Task 8: Update Profile Edit

**Files:**
- Modify: `apps/web/components/PlayerEditForm.tsx`

**Step 1: Update import and usage**

Replace the import (line 1):

```typescript
import { PlayerFormTabs } from './PlayerFormTabs'
```

Keep the component the same (already passes profile prop):

```typescript
export function PlayerEditForm({ profile }: { profile: Player }) {
  return <PlayerFormTabs profile={profile} />
}
```

**Step 2: Test edit flow**

Navigate to profile edit page
Test:
1. All tabs are unlocked (no locks)
2. No checkmarks on tabs
3. Can click any tab
4. Form saves correctly
5. Returns to profile view after save

Expected: All tabs accessible, save works

**Step 3: Commit**

```bash
git add apps/web/components/PlayerEditForm.tsx
git commit -m "refactor: use PlayerFormTabs in profile edit"
```

---

## Task 9: Clean Up Old Components

**Files:**
- Delete: `apps/web/components/PlayerOnboardingWizard.tsx`
- Delete: `apps/web/components/PlayerEditTabs.tsx`
- Delete: `apps/web/components/ui/FormStepper.tsx`

**Step 1: Verify no other files import these components**

Run grep to check:
```bash
grep -r "PlayerOnboardingWizard" apps/web --exclude-dir=node_modules
grep -r "PlayerEditTabs" apps/web --exclude-dir=node_modules
grep -r "FormStepper" apps/web --exclude-dir=node_modules
```

Expected: No imports found (or only in files we've already updated)

**Step 2: Delete old components**

```bash
rm apps/web/components/PlayerOnboardingWizard.tsx
rm apps/web/components/PlayerEditTabs.tsx
rm apps/web/components/ui/FormStepper.tsx
```

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove deprecated stepper components"
```

---

## Task 10: End-to-End Testing

**Files:**
- Test: Full onboarding and edit flows

**Step 1: Test first-time onboarding**

1. Create new player account (or clear existing player data)
2. Navigate to `/onboarding/player`
3. Verify Tab 1 active, tabs 2-6 locked
4. Complete all 6 steps sequentially
5. Verify redirects to dashboard after step 6

Expected: Full onboarding flow works, all tabs unlock sequentially

**Step 2: Test returning to onboarding**

1. Start onboarding, complete steps 1-3
2. Close browser/navigate away
3. Return to `/onboarding/player`
4. Verify tabs 1-3 unlocked with checkmarks
5. Verify tab 4 is active
6. Verify tabs 5-6 locked

Expected: Progress is preserved, can navigate back to completed steps

**Step 3: Test profile editing**

1. With completed profile, navigate to edit page
2. Verify all tabs unlocked
3. Edit different tabs in random order
4. Save changes
5. Verify all changes persisted

Expected: Can edit any tab, all changes save correctly

**Step 4: Test error handling**

1. In onboarding, submit invalid data (e.g., missing required field)
2. Verify error displays
3. Verify stays on current tab
4. Fix error and resubmit
5. Verify progresses to next tab

Expected: Errors display properly, doesn't navigate on error

**Step 5: Document any issues found**

If issues found, create GitHub issues or fix immediately

**Step 6: Final commit**

```bash
git add .
git commit -m "test: verify end-to-end onboarding and edit flows"
```

---

## Success Criteria

- [ ] Player model has completedSteps field
- [ ] Partial API tracks and returns completedSteps
- [ ] PlayerFormTabs component renders with tab navigation
- [ ] Onboarding mode: tabs unlock sequentially
- [ ] Onboarding mode: progress persists across sessions
- [ ] Onboarding mode: can navigate back to completed tabs
- [ ] Edit mode: all tabs always unlocked
- [ ] Tab visual states clear (completed checkmark, locked icon)
- [ ] "Save & Continue" button works in onboarding
- [ ] "Complete Profile" button works on final step
- [ ] "Save Changes" button works in edit mode
- [ ] Old components removed (PlayerOnboardingWizard, PlayerEditTabs, FormStepper)
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors
