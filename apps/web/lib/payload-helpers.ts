import { getPayload } from 'payload'
import type { Config } from '@/payload-types'

/**
 * PayloadCMS Query Helpers
 *
 * Simplified utilities for common PayloadCMS operations.
 */

// Type-safe collection names
export type CollectionName = keyof Config['collections']

/**
 * Get PayloadCMS instance (singleton pattern).
 * Cached to avoid repeated initialization.
 */
let payloadInstance: Awaited<ReturnType<typeof getPayload>> | null = null

export async function getPayloadClient() {
  if (!payloadInstance) {
    // Dynamically import config to avoid bundling it in route handlers
    const configPromise = import('@payload-config')
    const { default: config } = await configPromise
    payloadInstance = await getPayload({ config })
  }
  return payloadInstance
}

/**
 * Find a single document by ID.
 *
 * @example
 * ```ts
 * const player = await findById('players', playerId)
 * if (!player) return apiNotFound('Player not found')
 * ```
 */
export async function findById<T extends CollectionName>(
  collection: T,
  id: number | string
): Promise<Config['collections'][T] | null> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.findByID({
      collection,
      id,
    })
    return result as Config['collections'][T]
  } catch (error) {
    return null
  }
}

/**
 * Find one document matching a where clause.
 *
 * @example
 * ```ts
 * const user = await findOne('users', {
 *   clerkId: { equals: clerkUserId }
 * })
 * ```
 */
export async function findOne<T extends CollectionName>(
  collection: T,
  where: any
): Promise<Config['collections'][T] | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection,
    where,
    limit: 1,
  })
  return result.docs[0] || null
}

/**
 * Find all documents matching a where clause.
 *
 * @example
 * ```ts
 * const players = await findAll('players', {
 *   isActive: { equals: true }
 * })
 * ```
 */
export async function findAll<T extends CollectionName>(
  collection: T,
  where: any = {},
  options: {
    limit?: number
    page?: number
    sort?: string
    depth?: number
  } = {}
): Promise<Config['collections'][T][]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection,
    where,
    limit: options.limit || 100,
    page: options.page,
    sort: options.sort,
    depth: options.depth,
  })
  return result.docs as Config['collections'][T][]
}

/**
 * Create a new document.
 *
 * @example
 * ```ts
 * const newPlayer = await create('players', {
 *   user: userId,
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   // ...
 * })
 * ```
 */
export async function create<T extends CollectionName>(
  collection: T,
  data: any
): Promise<Config['collections'][T]> {
  const payload = await getPayloadClient()
  const result = await payload.create({
    collection,
    data,
  })
  return result as Config['collections'][T]
}

/**
 * Update a document by ID.
 *
 * @example
 * ```ts
 * const updated = await updateById('players', playerId, {
 *   bio: 'Updated bio'
 * })
 * ```
 */
export async function updateById<T extends CollectionName>(
  collection: T,
  id: number | string,
  data: any
): Promise<Config['collections'][T]> {
  const payload = await getPayloadClient()
  const result = await payload.update({
    collection,
    id,
    data,
  })
  return result as Config['collections'][T]
}

/**
 * Delete a document by ID.
 *
 * @example
 * ```ts
 * await deleteById('players', playerId)
 * ```
 */
export async function deleteById<T extends CollectionName>(
  collection: T,
  id: number | string
): Promise<void> {
  const payload = await getPayloadClient()
  await payload.delete({
    collection,
    id,
  })
}

/**
 * Count documents matching a where clause.
 *
 * @example
 * ```ts
 * const count = await countDocs('players', {
 *   graduationYear: { equals: '2025' }
 * })
 * ```
 */
export async function countDocs<T extends CollectionName>(
  collection: T,
  where: any = {}
): Promise<number> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection,
    where,
    limit: 0,
  })
  return result.totalDocs
}

/**
 * Check if a document exists.
 *
 * @example
 * ```ts
 * const exists = await exists('players', {
 *   user: { equals: userId }
 * })
 * ```
 */
export async function exists<T extends CollectionName>(
  collection: T,
  where: any
): Promise<boolean> {
  const count = await countDocs(collection, where)
  return count > 0
}

// ============================================================================
// Relationship Helpers
// ============================================================================

/**
 * Find documents and populate relationships.
 *
 * @example
 * ```ts
 * const savedPlayers = await findWithRelations('coach-saved-players', {
 *   coach: { equals: coachId }
 * }, { depth: 2 })
 * // savedPlayers[0].player is now fully populated
 * ```
 */
export async function findWithRelations<T extends CollectionName>(
  collection: T,
  where: any,
  options: { depth?: number; limit?: number; sort?: string } = {}
): Promise<Config['collections'][T][]> {
  return findAll(collection, where, {
    ...options,
    depth: options.depth || 1,
  })
}

// ============================================================================
// Raw Drizzle Access (for complex queries)
// ============================================================================

/**
 * Get direct access to Drizzle for complex queries.
 *
 * @example
 * ```ts
 * import { eq } from 'drizzle-orm'
 *
 * const { db, tables } = await getDb()
 * const users = await db.select().from(tables.users).where(eq(tables.users.clerkId, 'clerk_123'))
 * ```
 */
export async function getDb() {
  const payload = await getPayloadClient()
  return {
    db: payload.db.drizzle,
    tables: payload.db.tables,
  }
}
