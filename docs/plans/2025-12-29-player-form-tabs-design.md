# Player Form: Stepper to Tabs Refactoring

**Date**: 2025-12-29
**Status**: Approved

## Overview

Refactor the player form from a stepper-based onboarding wizard to a unified tab-based component that works for both onboarding and profile editing.

## Goals

- Single component for both onboarding and profile edit workflows
- Clear visual indicators for completed vs. future steps in onboarding
- Sequential unlocking in onboarding with forward/backward navigation
- All tabs always accessible in profile edit mode
- Incremental saves in onboarding for data safety

## Component Architecture

### Unified Component Structure

**New Component**: `PlayerFormTabs.tsx` replaces both `PlayerOnboardingWizard.tsx` and `PlayerEditTabs.tsx`

**Props Interface**:
```typescript
interface PlayerFormTabsProps {
  profile?: Player  // If present = edit mode, if absent = onboarding mode
}
```

**Mode Detection**:
```typescript
const isEditMode = !!profile
```

### Files to Change

**Create**:
- `apps/web/components/PlayerFormTabs.tsx` - New unified component

**Remove**:
- `apps/web/components/PlayerOnboardingWizard.tsx` - Replaced by PlayerFormTabs
- `apps/web/components/PlayerEditTabs.tsx` - Replaced by PlayerFormTabs
- `apps/web/components/ui/FormStepper.tsx` - No longer needed

**Modify**:
- `apps/web/components/PlayerEditForm.tsx` - Update to use PlayerFormTabs
- `apps/web/app/(frontend)/onboarding/player/page.tsx` - Update to use PlayerFormTabs
- All 6 wizard step components - Update props and buttons
- `apps/web/collections/Players.ts` - Add completedSteps field

**Keep**:
- All 6 wizard step components (PlayerBasicInfoStep.tsx, etc.) - Contain form fields

## Tab State & Visual Design

### Tab States

```typescript
type TabState = 'completed' | 'active' | 'unlocked' | 'locked'
```

**Onboarding Mode Logic**:
```typescript
const getTabState = (tabIndex: number, currentTab: number, completedSteps: number[]) => {
  if (completedSteps.includes(tabIndex + 1)) return 'completed'
  if (tabIndex === currentTab) return 'active'
  if (tabIndex <= Math.max(...completedSteps, 0)) return 'unlocked'
  return 'locked'
}
```

**Edit Mode**: All tabs are 'unlocked' except current tab is 'active'

### Visual States

- **Completed**: Green checkmark icon (✓) + normal text color + clickable
- **Active**: Blue underline border + blue text + clickable
- **Unlocked**: Normal text color + clickable + hover effects
- **Locked**: Gray text + lock icon (🔒) + not clickable + normal cursor

### Tab Unlocking Logic (Onboarding)

- Initially: Tab 1 active, tabs 2-6 locked
- After completing step N: Step N marked completed, step N+1 unlocked
- User can click back to any completed tab
- Click locked tab → no action (could add subtle shake animation)

### Navigation

- Click any unlocked/completed tab → switches to that tab
- "Save & Continue" button → saves current tab + navigates to next tab
- No "Back" button - tabs handle all navigation

## Data Persistence

### Backend Schema Changes

**Add to Player Model**:
```typescript
completedSteps: number[]  // e.g., [1, 2, 3, 4]
```

### API Endpoints

**Onboarding Mode**:

- **POST `/api/players/partial`** - Save progress for current step
  - Request: `{ step: number, data: FormData | JSON }`
  - Response: `{ success: true, completedSteps: number[] }`
  - Backend logic:
    - Upsert player record
    - Add step number to `completedSteps` array (if not present)
    - Return updated `completedSteps`

- **GET `/api/players/me`** - Fetch current user's player profile
  - Response: `{ player: Player | null }`
  - Used to populate form and get `completedSteps`

**Edit Mode**:

- **PUT `/api/players/:id`** - Save entire profile (existing endpoint)
  - No step tracking needed
  - Saves all tabs at once

### Data Flow

**Onboarding Mode**:
1. Component mounts → fetch `/api/players/me` to get existing progress
2. User fills out tab 1 → clicks "Save & Continue"
3. POST to `/api/players/partial` with step 1 data
4. Receive updated `completedSteps` array
5. Update local state: mark tab 1 completed, unlock tab 2, navigate to tab 2
6. Repeat for each tab
7. Last tab → "Complete Profile" → redirect to dashboard

**Edit Mode**:
1. Component receives `profile` prop with full data
2. User edits any tab(s)
3. Click "Save Changes" → PUT entire form to `/api/players/:id`
4. No step tracking, no navigation

## Component Implementation

### State Management

```typescript
const [activeTab, setActiveTab] = useState<number>(0) // 0-5 for tabs
const [completedSteps, setCompletedSteps] = useState<number[]>([])
const [isLoading, setIsLoading] = useState(false)
const [playerData, setPlayerData] = useState<Partial<Player> | null>(null)

const isEditMode = !!profile
```

### Initialization

```typescript
useEffect(() => {
  if (isEditMode) {
    setPlayerData(profile)
  } else {
    fetchPlayerProgress()
  }
}, [])

async function fetchPlayerProgress() {
  const response = await fetch('/api/players/me')
  const data = await response.json()

  if (data.player) {
    setPlayerData(data.player)
    setCompletedSteps(data.player.completedSteps || [])
    const firstIncomplete = findFirstIncompleteStep(data.player.completedSteps)
    setActiveTab(firstIncomplete)
  }
}
```

### Save Handlers

```typescript
// Onboarding mode
async function handleStepSave(stepNumber: number, stepData: any) {
  const response = await fetch('/api/players/partial', {
    method: 'POST',
    body: stepData
  })

  const result = await response.json()

  if (response.ok) {
    setCompletedSteps(result.completedSteps)
    if (stepNumber < 6) {
      setActiveTab(stepNumber)
    } else {
      window.location.href = '/'
    }
  }
}

// Edit mode
async function handleProfileUpdate(formData: FormData) {
  const response = await fetch(`/api/players/${profile.id}`, {
    method: 'PUT',
    body: formData
  })

  if (response.ok) {
    router.push('/profile')
    router.refresh()
  }
}
```

### Error Handling

- Display API errors above active tab content
- Don't navigate on error
- Keep user on current tab to fix issues
- Show validation errors inline (existing behavior)

## Step Component Adaptation

### Current Props

```typescript
interface StepProps {
  onNext: (data: any) => Promise<void>
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
  error: string | null
}
```

### New Props

```typescript
interface StepProps {
  onSave: (data: any) => Promise<void>
  error: string | null
  isLastStep: boolean
}
```

### Changes Needed

- Remove `onBack` functionality
- Remove `isFirstStep` prop
- Rename `onNext` to `onSave`
- Remove "Back" button from all step components
- Update button text logic

### Button Text

- **Onboarding, steps 1-5**: "Save & Continue"
- **Onboarding, step 6**: "Complete Profile"
- **Edit mode, all steps**: "Save Changes"

## Page Integration

**Onboarding Page** (`/onboarding/player/page.tsx`):
```tsx
<FormPageLayout title="Complete Your Player Profile">
  <PlayerFormTabs />
</FormPageLayout>
```

**Profile Edit** (wherever it lives):
```tsx
<PlayerFormTabs profile={playerData} />
```

## User Experience Flow

### First-time Onboarding

1. Land on page → Tab 1 active, tabs 2-6 locked
2. Fill out Basic Info → click "Save & Continue"
3. Tab 1 shows checkmark, Tab 2 becomes active
4. Repeat through all 6 tabs
5. Final tab → "Complete Profile" → redirect to dashboard

### Returning to Onboarding

1. Land on page → fetch progress
2. Tabs 1-N unlocked based on `completedSteps`
3. Active tab = first incomplete step
4. Can click back to review/edit completed tabs
5. Continue from first incomplete tab forward

### Profile Editing

1. All tabs unlocked, no checkmarks
2. Click any tab to edit that section
3. "Save Changes" saves everything
4. Returns to profile view
5. No auto-navigation between tabs

## Benefits

- **Single source of truth**: One component for both flows
- **Better UX**: Clear progress indicators in onboarding
- **Data safety**: Incremental saves prevent data loss
- **Flexibility**: Can navigate forward/backward through completed steps
- **Consistency**: Same tab interface for onboarding and editing
- **Maintainability**: Reuse existing step components, reduce duplication
