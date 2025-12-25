import { currentUser } from '@clerk/nextjs/server'
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { User, Player, Coach } from '@/payload-types'

/**
 * Auth Context - Uses PayloadCMS Local API
 *
 * For raw Drizzle queries when needed, you can access the Drizzle instance:
 *
 * @example
 * ```ts
 * import { eq } from 'drizzle-orm'
 * const payload = await getPayload({ config })
 * const db = payload.db.drizzle
 *
 * // Access PayloadCMS-managed tables
 * const users = await db.select().from(payload.db.tables.users).where(eq(payload.db.tables.users.clerkId, 'clerk_123'))
 * ```
 *
 * See: https://payloadcms.com/docs/database/postgres
 */

export type AuthContext = {
  clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>
  dbUser: User
  playerProfile?: Player | null
  coachProfile?: Coach | null
}

/**
 * Get the current authenticated user context.
 * This includes both Clerk user and database user + profile.
 *
 * Cached per request to avoid duplicate database queries.
 *
 * @throws Error if user is not authenticated or not found in database
 */
export const getAuthContext = cache(async (): Promise<AuthContext> => {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    throw new Error('Unauthorized: No Clerk user found')
  }

  const payload = await getPayload({ config })

  // Find user in database by clerkId
  const usersResult = await payload.find({
    collection: 'users',
    where: {
      clerkId: {
        equals: clerkUser.id,
      },
    },
    limit: 1,
  })

  if (usersResult.docs.length === 0) {
    throw new Error('User not found in database')
  }

  const dbUser = usersResult.docs[0]!

  // Optionally load profile based on role
  let playerProfile: Player | null = null
  let coachProfile: Coach | null = null

  const role = clerkUser.publicMetadata?.role as string

  if (role === 'player') {
    const playersResult = await payload.find({
      collection: 'players',
      where: {
        user: {
          equals: dbUser.id,
        },
      },
      limit: 1,
    })
    playerProfile = playersResult.docs[0] || null
  } else if (role === 'coach') {
    const coachesResult = await payload.find({
      collection: 'coaches',
      where: {
        user: {
          equals: dbUser.id,
        },
      },
      limit: 1,
    })
    coachProfile = coachesResult.docs[0] || null
  }

  return {
    clerkUser,
    dbUser,
    playerProfile,
    coachProfile,
  }
})

/**
 * Require that the current user has a specific role.
 *
 * @param role - The required role ('player' | 'coach')
 * @throws Error if user doesn't have the required role
 */
export async function requireRole(role: 'player' | 'coach'): Promise<AuthContext> {
  const context = await getAuthContext()

  const userRole = context.clerkUser.publicMetadata?.role as string

  if (userRole !== role) {
    throw new Error(`Forbidden: Requires ${role} role`)
  }

  return context
}

/**
 * Require that the current user is a player with a complete profile.
 *
 * @throws Error if user is not a player or doesn't have a profile
 */
export async function requirePlayer(): Promise<AuthContext & { playerProfile: NonNullable<AuthContext['playerProfile']> }> {
  const context = await requireRole('player')

  if (!context.playerProfile) {
    throw new Error('Player profile not found')
  }

  return { ...context, playerProfile: context.playerProfile }
}

/**
 * Require that the current user is a coach with a complete profile.
 *
 * @throws Error if user is not a coach or doesn't have a profile
 */
export async function requireCoach(): Promise<AuthContext & { coachProfile: NonNullable<AuthContext['coachProfile']> }> {
  const context = await requireRole('coach')

  if (!context.coachProfile) {
    throw new Error('Coach profile not found')
  }

  return { ...context, coachProfile: context.coachProfile }
}

/**
 * Get auth context as a pair [context, error]
 * Useful for routes that want to handle auth failures gracefully
 *
 * @returns Tuple of [AuthContext | null, Error | null]
 */
export async function tryGetAuthContext(): Promise<[AuthContext | null, Error | null]> {
  try {
    const context = await getAuthContext()
    return [context, null]
  } catch (error) {
    return [null, error instanceof Error ? error : new Error('Authentication failed')]
  }
}
