# Role Standardization Guide

## Overview
This document clarifies the role/roles naming convention used throughout the application.

## The Standard

### Clerk `publicMetadata` (singular)
```typescript
clerkUser.publicMetadata.role  // ✅ Correct: singular string
```

**Type:** `string`
**Values:** `'player' | 'coach' | 'admin'`
**Example:** `{ role: 'coach' }`

### PayloadCMS `roles` field (plural)
```typescript
payloadUser.roles  // ✅ Correct: plural array
```

**Type:** `string[]`
**Values:** `['player'] | ['coach'] | ['admin']`
**Example:** `{ roles: ['coach'] }`

## Why Two Different Conventions?

1. **Clerk** uses `role` (singular) because:
   - Simpler for authorization checks
   - Most users have only one role
   - Easier to read: `if (role === 'coach')`

2. **PayloadCMS** uses `roles` (plural array) because:
   - PayloadCMS auth system expects arrays
   - More flexible (supports multiple roles in the future)
   - Standard PayloadCMS convention

## Naming Conventions

### Clerk API (snake_case)
Clerk's API uses snake_case (this is their convention, we can't change it):
- `first_name`
- `last_name`
- `email_addresses`
- `public_metadata`
- `unsafe_metadata`

### Our Application Code (camelCase)
Our JavaScript/TypeScript code uses camelCase:
- `firstName`
- `lastName`
- `emailAddresses`

## Data Flow

```
1. User Registration
   └─> unsafeMetadata.userType = 'coach'

2. Clerk Webhook (user.created)
   └─> Reads unsafeMetadata.userType
   └─> Sets publicMetadata.role = 'coach'  [singular]
   └─> Creates PayloadCMS user with roles = ['coach']  [plural array]

3. Application Authorization
   └─> Reads clerkUser.publicMetadata.role  [singular]
   └─> Checks: if (role === 'coach')
```

## Code Examples

### ✅ Correct Usage

**Checking role in API routes:**
```typescript
const role = clerkUser.publicMetadata?.role as string | undefined
if (role === 'coach') {
  // Allow access
}
```

**Setting role in webhook:**
```typescript
await clerkClient.users.updateUserMetadata(id, {
  publicMetadata: {
    role: 'coach'  // singular
  }
})
```

**Creating PayloadCMS user:**
```typescript
await payload.create({
  collection: 'users',
  data: {
    roles: ['coach']  // plural array
  }
})
```

### ❌ Incorrect Usage

```typescript
// DON'T use roles (plural) in Clerk publicMetadata
const roles = clerkUser.publicMetadata?.roles  // ❌ Wrong!

// DON'T use role (singular) in PayloadCMS
await payload.create({
  data: { role: 'coach' }  // ❌ Wrong!
})
```

## Files Updated for Standardization

- ✅ `app/api/webhooks/clerk/route.ts` - Sets `publicMetadata.role`
- ✅ `app/api/saved-players/route.ts` - Reads `publicMetadata.role`
- ✅ `app/api/prospects/route.ts` - Reads `publicMetadata.role`
- ✅ `app/players/page.tsx` - Reads `publicMetadata.role`
- ✅ `lib/syncClerkUser.ts` - Reads `publicMetadata.role`, creates with `roles` array
- ✅ `app/api/admin-login/route.ts` - Reads `publicMetadata.role`

## Quick Reference

| Location | Property | Type | Example |
|----------|----------|------|---------|
| Clerk `publicMetadata` | `role` | `string` | `'coach'` |
| PayloadCMS Users | `roles` | `string[]` | `['coach']` |
| Clerk API payloads | `snake_case` | varies | `first_name` |
| Our application code | `camelCase` | varies | `firstName` |
