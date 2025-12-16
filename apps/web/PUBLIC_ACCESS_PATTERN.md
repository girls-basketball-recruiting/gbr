# Public Access Pattern

This document explains how public (unauthenticated) and authenticated access works across the application.

## Overview

All pages are accessible to both authenticated and unauthenticated users. The difference is in what information is shown and what actions are available.

## Navigation

### Unauthenticated Users (Public)
- **Sidebar shows:**
  - Programs (browse colleges)
  - Tournaments (browse events)
  - Sign In / Sign Up buttons in footer

### Authenticated Users
- **Coaches see:**
  - Dashboard
  - Browse Players
  - My Prospects
  - Programs
  - Tournaments
  - Edit Profile
  - User menu

- **Players see:**
  - Dashboard
  - Coaches
  - Programs
  - Tournaments
  - Edit Profile
  - User menu

## Content Visibility

### What's Public (Always Visible)

**Programs/Colleges:**
- ✅ All college information (school, location, division, conference, type)
- ✅ Which colleges have coaches registered
- ✅ Full list browsing and filtering

**Tournaments:**
- ✅ Name, location, dates, description
- ✅ Website link
- ✅ List browsing and filtering

**Players (List View):**
- ✅ Name, position, graduation year
- ✅ City, state, high school

**Coaches (List View):**
- ✅ Name, college, position, division

### What's Protected (Login Required)

**Player Profiles:**
- 🔒 GPA (weighted/unweighted)
- 🔒 Contact information
- 🔒 Highlight videos
- 🔒 Tournament schedule
- 🔒 Full bio

**Coach Profiles:**
- 🔒 Email address
- 🔒 Phone number
- 🔒 Full bio
- 🔒 Detailed program information

**Tournament Details:**
- 🔒 Attendee count ("X players attending")
- 🔒 List of attending players
- 🔒 RSVP/attendance actions

## Implementation Pattern

### Using the UnauthenticatedCTA Component

```tsx
import { UnauthenticatedCTA } from '@/components/UnauthenticatedCTA'
import { useUser } from '@clerk/nextjs'

export function SomeComponent() {
  const { user } = useUser()
  const isAuthenticated = !!user

  return (
    <div>
      {isAuthenticated ? (
        <div>Protected content here...</div>
      ) : (
        <UnauthenticatedCTA
          title="Sign in to view full details"
          description="Create an account to access contact information and more."
          playerCTA // Shows "Sign Up as Player" button
        />
      )}
    </div>
  )
}
```

### UnauthenticatedCTA Props

- `title`: Heading text (e.g., "Sign in to view contact information")
- `description`: Explanation text
- `playerCTA`: (boolean) Show player-specific sign up button
- `coachCTA`: (boolean) Show coach-specific sign up button
- If neither playerCTA nor coachCTA is set, shows generic "Sign In" + "Sign Up" buttons

### Checking Authentication in Client Components

```tsx
'use client'
import { useUser } from '@clerk/nextjs'

export function MyComponent() {
  const { user } = useUser()
  const isAuthenticated = !!user
  const role = user?.publicMetadata?.role as 'coach' | 'player' | undefined

  if (isAuthenticated) {
    // Show full content
  } else {
    // Show limited content with CTAs
  }
}
```

### Checking Authentication in Server Components

```tsx
import { currentUser } from '@clerk/nextjs/server'

export default async function MyPage() {
  const user = await currentUser()
  const isAuthenticated = !!user
  const role = user?.publicMetadata?.role as 'coach' | 'player' | undefined

  if (isAuthenticated) {
    // Show full content
  } else {
    // Show limited content with CTAs
  }
}
```

## Best Practices

1. **Always show something useful** - Don't just block access entirely. Show public information with CTAs for more details.

2. **Clear value proposition** - CTAs should explain what the user gets by signing up (e.g., "Sign in to see who's attending")

3. **Contextual CTAs** - Tailor the CTA message to what's being hidden (contact info, attendance, etc.)

4. **Consistent patterns** - Use the same authentication checks and CTA components throughout

5. **SEO-friendly** - Public content is indexed by search engines, protected content is not

## Examples in Codebase

- **TournamentCard** (`components/ui/TournamentCard.tsx`): Shows "Sign in to see who's attending" instead of attendee count
- **AppSidebar** (`components/app-sidebar.tsx`): Shows different navigation for public vs authenticated users
- **UnauthenticatedCTA** (`components/UnauthenticatedCTA.tsx`): Reusable CTA component with lock icon

## Future Additions

When adding new protected features:

1. Determine what should be public vs protected
2. Add authentication check using `useUser()` or `currentUser()`
3. Show appropriate CTA using `<UnauthenticatedCTA>` or custom UI
4. Update this document with the new pattern
