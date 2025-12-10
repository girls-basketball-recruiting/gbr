# Clerk Metadata Standardization

## The Problem (Fixed)

Previously, user roles weren't being properly stored in Clerk's metadata, causing:

- Empty `unsafeMetadata` and `publicMetadata` objects at runtime
- Inconsistent use of `userType` vs `role`
- Confusion between `unsafeMetadata` and `publicMetadata`

## The Solution

We now use a standardized approach with **`publicMetadata.role`** as a **string** value.

### Why `publicMetadata`?

- **More secure**: Can only be written from the backend (via webhook)
- **Still accessible**: Available on the frontend for UI logic
- **Cannot be manipulated**: Users cannot modify it client-side

### Metadata Flow

```
1. User signs up at /register-player or /register-coach
   ↓
2. SignUp component sets: unsafeMetadata.userType = 'player' | 'coach'
   (Client-side, temporary storage during signup)
   ↓
3. Clerk webhook fires (user.created event)
   ↓
4. Webhook reads unsafeMetadata.userType
   ↓
5. Webhook calls Clerk API to set: publicMetadata.role = 'player' | 'coach'
   (Backend-only, permanent, secure)
   ↓
6. Webhook creates PayloadCMS user with roles: ['player'] | ['coach']
   (PayloadCMS uses array, but Clerk uses string)
   ↓
7. Frontend reads publicMetadata.role for dashboard routing
```

## Current Implementation

### Clerk (Frontend)

- **Property**: `publicMetadata.role`
- **Type**: `'player' | 'coach' | 'admin'` (string)
- **Usage**: `clerkUser.publicMetadata?.role`

### PayloadCMS (Backend)

- **Property**: `roles`
- **Type**: `('player' | 'coach' | 'admin')[]` (array)
- **Usage**: `payloadUser.roles?.includes('player')`

### Files Updated

1. **Webhook** (`app/(frontend)/api/webhooks/clerk/route.ts`):
   - Imports `clerkClient` to update metadata
   - Reads from `unsafeMetadata.userType` during signup
   - Updates Clerk user with `publicMetadata.role`
   - Creates PayloadCMS user with `roles: [role]`

2. **DashboardPage** (`components/DashboardPage.tsx`):
   - Reads `clerkUser.publicMetadata?.role`
   - Routes to PlayerDashboard or CoachDashboard based on role

3. **Sign-up pages** (unchanged):
   - Still set `unsafeMetadata.userType` during signup
   - Webhook handles moving it to `publicMetadata.role`

## Testing

After this fix, when you inspect a Clerk user at runtime:

```typescript
const user = await currentUser()
console.log(user.publicMetadata) // { role: 'player' } or { role: 'coach' }
console.log(user.unsafeMetadata) // { userType: 'player' } or { userType: 'coach' }
```

The `publicMetadata.role` is what you should use in your application code.
