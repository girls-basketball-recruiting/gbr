# PayloadCMS + Drizzle Usage Patterns

This guide shows how to query your database using PayloadCMS while still having access to raw Drizzle when needed.

## 🎯 General Rule

**Use PayloadCMS Local API for most operations.** Only use raw Drizzle (`payload.db.drizzle`) for complex queries or performance optimization.

---

## ✅ PayloadCMS Local API (Recommended)

### Basic Queries

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

// Find all active players
const players = await payload.find({
  collection: 'players',
  where: {
    isActive: {
      equals: true,
    },
  },
  limit: 50,
  sort: '-createdAt',
})

// Find one player by ID
const player = await payload.findByID({
  collection: 'players',
  id: 123,
})

// Create a new player
const newPlayer = await payload.create({
  collection: 'players',
  data: {
    user: userId,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    graduationYear: '2025',
    city: 'Atlanta',
    state: 'GA',
    highSchool: 'North Atlanta HS',
    heightInInches: 72,
    primaryPosition: 'point-guard',
    profileImageUrl: 'https://...',
  },
})

// Update a player
const updated = await payload.update({
  collection: 'players',
  id: 123,
  data: {
    bio: 'Updated bio text',
  },
})

// Delete (or soft delete)
await payload.delete({
  collection: 'players',
  id: 123,
})
```

### Complex Queries

```typescript
// Find players by graduation year and position
const guards = await payload.find({
  collection: 'players',
  where: {
    and: [
      {
        graduationYear: {
          equals: '2025',
        },
      },
      {
        or: [
          {
            primaryPosition: {
              equals: 'point-guard',
            },
          },
          {
            primaryPosition: {
              equals: 'combo-guard',
            },
          },
        ],
      },
    ],
  },
})

// Search by text fields
const searchResults = await payload.find({
  collection: 'players',
  where: {
    firstName: {
      contains: 'John',
    },
  },
})

// Relationship queries
const coachPlayers = await payload.find({
  collection: 'coach-saved-players',
  where: {
    coach: {
      equals: coachId,
    },
  },
  // Populate the player relationship
  depth: 1,
})
```

### Pagination

```typescript
const page1 = await payload.find({
  collection: 'players',
  limit: 20,
  page: 1,
  sort: '-createdAt',
})

console.log(page1.docs) // Array of players
console.log(page1.totalDocs) // Total count
console.log(page1.totalPages) // Number of pages
console.log(page1.hasNextPage) // Boolean
```

---

## 🔧 Raw Drizzle Queries (Advanced)

Use `payload.db.drizzle` when you need:
- Complex joins
- Raw SQL
- Performance-critical queries
- Aggregations

### Accessing Drizzle

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'
import { eq, and, or, sql } from 'drizzle-orm'

const payload = await getPayload({ config })
const db = payload.db.drizzle
const tables = payload.db.tables

// Tables are available as:
// - tables.users
// - tables.players
// - tables.coaches
// - tables.colleges
// - tables['coach-player-notes']
// etc.
```

### Simple Select

```typescript
// Find user by clerkId
const users = await db
  .select()
  .from(tables.users)
  .where(eq(tables.users.clerkId, 'clerk_123'))

const user = users[0]
```

### Joins

```typescript
// Join players with users
const playersWithUsers = await db
  .select({
    player: tables.players,
    user: tables.users,
  })
  .from(tables.players)
  .innerJoin(tables.users, eq(tables.players.user, tables.users.id))
  .where(eq(tables.players.isActive, true))
```

### Aggregations

```typescript
// Count players by graduation year
const stats = await db
  .select({
    graduationYear: tables.players.graduationYear,
    count: sql<number>`count(*)`,
  })
  .from(tables.players)
  .groupBy(tables.players.graduationYear)
```

### Complex Where Clauses

```typescript
// Players with specific criteria
const filteredPlayers = await db
  .select()
  .from(tables.players)
  .where(
    and(
      eq(tables.players.isActive, true),
      or(
        eq(tables.players.graduationYear, '2025'),
        eq(tables.players.graduationYear, '2026')
      )
    )
  )
```

### Transactions

```typescript
await db.transaction(async (tx) => {
  // Create user
  const newUser = await tx.insert(tables.users).values({
    email: 'test@example.com',
    clerkId: 'clerk_123',
    firstName: 'Test',
    lastName: 'User',
  }).returning()

  // Create player profile
  await tx.insert(tables.players).values({
    user: newUser[0].id,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    graduationYear: '2025',
    city: 'Atlanta',
    state: 'GA',
    highSchool: 'Test HS',
    heightInInches: 72,
    primaryPosition: 'point-guard',
    profileImageUrl: 'https://...',
  })
})
```

---

## 🎨 Best Practices

### 1. Prefer PayloadCMS API

```typescript
// ✅ GOOD - Use PayloadCMS API
const player = await payload.findByID({
  collection: 'players',
  id: playerId,
})

// ❌ AVOID - Unless you have a specific reason
const player = await db
  .select()
  .from(tables.players)
  .where(eq(tables.players.id, playerId))
```

### 2. Use Drizzle for Complex Joins

```typescript
// ✅ GOOD - Complex join query
const coachNotes = await db
  .select({
    note: tables['coach-player-notes'],
    player: tables.players,
    coach: tables.coaches,
  })
  .from(tables['coach-player-notes'])
  .innerJoin(tables.players, eq(tables['coach-player-notes'].player, tables.players.id))
  .innerJoin(tables.coaches, eq(tables['coach-player-notes'].coach, tables.coaches.id))
  .where(eq(tables.coaches.id, coachId))
```

### 3. Use PayloadCMS for Mutations

```typescript
// ✅ GOOD - PayloadCMS handles hooks, validation, etc.
await payload.update({
  collection: 'players',
  id: playerId,
  data: { bio: 'Updated' },
})

// ❌ AVOID - Bypasses PayloadCMS hooks and validation
await db
  .update(tables.players)
  .set({ bio: 'Updated' })
  .where(eq(tables.players.id, playerId))
```

### 4. Performance Optimization

```typescript
// For read-heavy operations with complex logic, Drizzle can be faster
const popularPlayers = await db
  .select({
    id: tables.players.id,
    name: sql<string>`concat(${tables.players.firstName}, ' ', ${tables.players.lastName})`,
    saveCount: sql<number>`count(${tables['coach-saved-players'].id})`,
  })
  .from(tables.players)
  .leftJoin(
    tables['coach-saved-players'],
    eq(tables.players.id, tables['coach-saved-players'].player)
  )
  .groupBy(tables.players.id)
  .orderBy(sql`count(${tables['coach-saved-players'].id}) desc`)
  .limit(10)
```

---

## 📚 Type Safety

PayloadCMS generates types automatically in `payload-types.ts`:

```typescript
import type { Player, User, Coach } from '@/payload-types'

// These types match your Collections exactly
const player: Player = await payload.findByID({
  collection: 'players',
  id: 123,
})
```

For Drizzle queries, infer types from the query:

```typescript
const result = await db.select().from(tables.players)
type PlayerRow = typeof result[0]
```

---

## 🔗 Resources

- [PayloadCMS Local API](https://payloadcms.com/docs/local-api/overview)
- [PayloadCMS Postgres Adapter](https://payloadcms.com/docs/database/postgres)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
