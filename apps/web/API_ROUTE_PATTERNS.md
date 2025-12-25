# API Route Patterns - DRY Guidelines

This guide shows how to write clean, DRY API routes using our helper utilities.

## 📚 Available Utilities

### Auth Helpers (`lib/api-helpers.ts`)
- `withAuth()` - Get authenticated user
- `withPlayer()` - Require player auth with profile
- `withCoach()` - Require coach auth with profile

### Response Helpers (`lib/api-helpers.ts`)
- `apiSuccess(data, status?)` - Success response
- `apiError(message, status?)` - Error response
- `apiValidationError(message)` - 400 validation error
- `apiUnauthorized(message?)` - 401 unauthorized
- `apiForbidden(message?)` - 403 forbidden
- `apiNotFound(message?)` - 404 not found
- `handleApiError(handler)` - Automatic error handling wrapper

### Request Parsing (`lib/api-helpers.ts`)
- `parseJsonBody<T>(req)` - Parse JSON with error handling
- `parseFormData(req)` - Parse FormData with error handling

### PayloadCMS Helpers (`lib/payload-helpers.ts`)
- `findById(collection, id)` - Find by ID
- `findOne(collection, where)` - Find single document
- `findAll(collection, where, options?)` - Find multiple documents
- `findWithRelations(collection, where, options)` - Find with populated relationships
- `create(collection, data)` - Create document
- `updateById(collection, id, data)` - Update by ID
- `deleteById(collection, id)` - Delete by ID
- `exists(collection, where)` - Check if exists
- `countDocs(collection, where?)` - Count documents
- `getDb()` - Get raw Drizzle access for complex queries

---

## 🎯 Common Patterns

### Pattern 1: Simple GET Route (No Auth Required)

```typescript
import { handleApiError, apiSuccess, apiNotFound } from '@/lib/api-helpers'
import { findById } from '@/lib/payload-helpers'

export const GET = handleApiError(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params

  const player = await findById('players', parseInt(id))
  if (!player) return apiNotFound('Player not found')

  return apiSuccess({ player })
})
```

### Pattern 2: Authenticated GET Route

```typescript
import { handleApiError, withAuth, apiSuccess } from '@/lib/api-helpers'
import { findOne } from '@/lib/payload-helpers'

export const GET = handleApiError(async () => {
  const [auth, authError] = await withAuth()
  if (authError) return authError

  const player = await findOne('players', {
    user: { equals: auth.dbUser.id }
  })

  return apiSuccess({ player })
})
```

### Pattern 3: Player-Only Route

```typescript
import { handleApiError, withPlayer, apiSuccess } from '@/lib/api-helpers'
import { updateById } from '@/lib/payload-helpers'

export const PUT = handleApiError(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const [auth, authError] = await withPlayer()
  if (authError) return authError

  // Verify ownership
  if (auth.playerProfile.id !== parseInt(id)) {
    return apiForbidden('Cannot edit another player's profile')
  }

  const [body, bodyError] = await parseJsonBody(req)
  if (bodyError) return bodyError

  const updated = await updateById('players', id, body)
  return apiSuccess({ player: updated })
})
```

### Pattern 4: Coach-Only Route

```typescript
import { handleApiError, withCoach, apiSuccess } from '@/lib/api-helpers'
import { findAll } from '@/lib/payload-helpers'

export const GET = handleApiError(async () => {
  const [auth, authError] = await withCoach()
  if (authError) return authError

  const prospects = await findAll(
    'coach-prospects',
    { coach: { equals: auth.coachProfile.id } },
    { sort: '-createdAt', limit: 50 }
  )

  return apiSuccess({ prospects })
})
```

### Pattern 5: POST Route with Validation

```typescript
import {
  handleApiError,
  withPlayer,
  parseJsonBody,
  apiSuccess,
  apiValidationError,
} from '@/lib/api-helpers'
import { create, exists } from '@/lib/payload-helpers'

export const POST = handleApiError(async (req: Request) => {
  const [auth, authError] = await withPlayer()
  if (authError) return authError

  const [body, bodyError] = await parseJsonBody<{
    tournamentId: number
  }>(req)
  if (bodyError) return bodyError

  const { tournamentId } = body
  if (!tournamentId) {
    return apiValidationError('tournamentId is required')
  }

  // Check if already attending
  const alreadyAttending = await exists('players-tournaments', {
    and: [
      { player: { equals: auth.playerProfile.id } },
      { tournament: { equals: tournamentId } },
    ],
  })

  if (alreadyAttending) {
    return apiValidationError('Already attending this tournament')
  }

  const attendance = await create('players-tournaments', {
    player: auth.playerProfile.id,
    tournament: tournamentId,
  })

  return apiSuccess({ attendance }, 201)
})
```

### Pattern 6: DELETE Route

```typescript
import {
  handleApiError,
  withPlayer,
  apiForbidden,
  apiSuccess,
  apiNotFound,
} from '@/lib/api-helpers'
import { findById, deleteById } from '@/lib/payload-helpers'

export const DELETE = handleApiError(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const [auth, authError] = await withPlayer()
  if (authError) return authError

  const player = await findById('players', parseInt(id))
  if (!player) return apiNotFound('Player not found')

  // Verify ownership
  if (player.user !== auth.dbUser.id) {
    return apiForbidden('Cannot delete another player's profile')
  }

  await deleteById('players', id)
  return apiSuccess({ success: true })
})
```

### Pattern 7: Route with Relationships

```typescript
import { handleApiError, withCoach, apiSuccess } from '@/lib/api-helpers'
import { findWithRelations } from '@/lib/payload-helpers'

export const GET = handleApiError(async () => {
  const [auth, authError] = await withCoach()
  if (authError) return authError

  // This populates the 'player' relationship automatically
  const savedPlayers = await findWithRelations(
    'coach-saved-players',
    { coach: { equals: auth.coachProfile.id } },
    { depth: 2, sort: '-savedAt' } // depth: 2 also populates player.user
  )

  return apiSuccess({ savedPlayers })
})
```

### Pattern 8: Complex Query with Raw Drizzle

```typescript
import { handleApiError, withCoach, apiSuccess } from '@/lib/api-helpers'
import { getDb } from '@/lib/payload-helpers'
import { eq, and, desc } from 'drizzle-orm'

export const GET = handleApiError(async () => {
  const [auth, authError] = await withCoach()
  if (authError) return authError

  // For complex queries, use raw Drizzle
  const { db, tables } = await getDb()

  const notes = await db
    .select({
      note: tables['coach-player-notes'],
      player: tables.players,
    })
    .from(tables['coach-player-notes'])
    .innerJoin(
      tables.players,
      eq(tables['coach-player-notes'].player, tables.players.id)
    )
    .where(
      and(
        eq(tables['coach-player-notes'].coach, auth.coachProfile.id),
        eq(tables.players.isActive, true)
      )
    )
    .orderBy(desc(tables['coach-player-notes'].updatedAt))

  return apiSuccess({ notes })
})
```

### Pattern 9: FormData Upload

```typescript
import {
  handleApiError,
  withPlayer,
  parseFormData,
  apiSuccess,
  apiValidationError,
} from '@/lib/api-helpers'
import { updateById } from '@/lib/payload-helpers'
import { uploadProfileImage } from '@/lib/blob-storage'

export const PUT = handleApiError(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const [auth, authError] = await withPlayer()
  if (authError) return authError

  const [formData, formError] = await parseFormData(req)
  if (formError) return formError

  const profileImage = formData.get('profileImage') as File | null

  let profileImageUrl: string | undefined
  if (profileImage && profileImage.size > 0) {
    profileImageUrl = await uploadProfileImage(
      profileImage,
      auth.dbUser.id,
      'player',
      auth.playerProfile.profileImageUrl
    )
  }

  const updated = await updateById('players', id, {
    bio: formData.get('bio'),
    profileImageUrl,
  })

  return apiSuccess({ player: updated })
})
```

---

## ✅ Checklist for Refactoring

When refactoring an API route, follow these steps:

1. **Replace auth boilerplate** with `withAuth()`, `withPlayer()`, or `withCoach()`
2. **Wrap handler** with `handleApiError()` for automatic error handling
3. **Use response helpers** (`apiSuccess`, `apiError`, etc.) for consistent responses
4. **Replace Drizzle queries** with PayloadCMS helpers where possible
5. **Use `parseJsonBody()` or `parseFormData()`** for request parsing
6. **Remove all try/catch blocks** - `handleApiError()` handles this
7. **Remove manual auth checks** - auth helpers handle this
8. **Remove manual error responses** - use helper functions

---

## 🚫 Common Mistakes to Avoid

### ❌ Don't mix patterns

```typescript
// BAD: Manual auth checking after using helpers
export const GET = handleApiError(async () => {
  const [auth, authError] = await withCoach()
  if (authError) return authError

  const clerkUser = await currentUser() // ❌ Unnecessary, already in auth
  if (!clerkUser) return apiUnauthorized() // ❌ Already handled by withCoach
})
```

### ❌ Don't add redundant try/catch

```typescript
// BAD: handleApiError already catches errors
export const GET = handleApiError(async () => {
  try { // ❌ Redundant
    const [auth, authError] = await withCoach()
    if (authError) return authError

    const players = await findAll('players', {})
    return apiSuccess({ players })
  } catch (error) {
    return apiError('Failed', 500)
  }
})
```

### ❌ Don't use raw Drizzle for simple queries

```typescript
// BAD: Using raw Drizzle for simple query
const { db, tables } = await getDb()
const player = await db.select().from(tables.players).where(eq(tables.players.id, playerId))

// GOOD: Use PayloadCMS helper
const player = await findById('players', playerId)
```

---

## 📖 Summary

With these utilities, your API routes should be:
- **~70% shorter** than before
- **Easier to read** and understand
- **Consistent** in error handling and responses
- **Type-safe** with PayloadCMS generated types
- **DRY** - no repeated auth/error handling code

All auth error handling is centralized in `lib/auth-context.ts`, so you never have to think about it again!
