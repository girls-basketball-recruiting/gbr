import { NextResponse } from 'next/server'
import { getAuthContext, requirePlayer, requireCoach, type AuthContext } from './auth-context'
import type { Player, Coach } from '@/payload-types'

/**
 * API Helpers - DRY utilities for API routes
 *
 * These helpers eliminate boilerplate by:
 * - Automatically handling auth errors
 * - Providing consistent response formatting
 * - Centralizing error handling
 */

// ============================================================================
// Auth Helpers
// ============================================================================

/**
 * Get authenticated user context for API routes.
 * Returns tuple of [context, error response].
 *
 * @example
 * ```ts
 * export async function GET() {
 *   const [auth, authError] = await withAuth()
 *   if (authError) return authError
 *
 *   // Use auth.clerkUser, auth.dbUser, etc.
 *   return apiSuccess({ user: auth.dbUser })
 * }
 * ```
 */
export async function withAuth(): Promise<[AuthContext, null] | [null, NextResponse]> {
  try {
    const context = await getAuthContext()
    return [context, null]
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed'

    if (message.includes('Unauthorized')) {
      return [null, apiError('Unauthorized', 401)]
    }
    if (message.includes('not found')) {
      return [null, apiError('User not found in database', 404)]
    }
    return [null, apiError(message, 500)]
  }
}

/**
 * Require player auth with profile.
 * Returns tuple of [context with player, error response].
 *
 * @example
 * ```ts
 * export async function GET() {
 *   const [auth, authError] = await withPlayer()
 *   if (authError) return authError
 *
 *   // auth.playerProfile is guaranteed to exist
 *   return apiSuccess({ player: auth.playerProfile })
 * }
 * ```
 */
export async function withPlayer(): Promise<
  [AuthContext & { playerProfile: Player }, null] | [null, NextResponse]
> {
  try {
    const context = await requirePlayer()
    return [context, null]
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Player authentication failed'

    if (message.includes('Unauthorized') || message.includes('Requires player role')) {
      return [null, apiError('Unauthorized: Player role required', 403)]
    }
    if (message.includes('not found')) {
      return [null, apiError('Player profile not found', 404)]
    }
    return [null, apiError(message, 500)]
  }
}

/**
 * Require coach auth with profile.
 * Returns tuple of [context with coach, error response].
 *
 * @example
 * ```ts
 * export async function POST(req: Request) {
 *   const [auth, authError] = await withCoach()
 *   if (authError) return authError
 *
 *   // auth.coachProfile is guaranteed to exist
 *   return apiSuccess({ coach: auth.coachProfile })
 * }
 * ```
 */
export async function withCoach(): Promise<
  [AuthContext & { coachProfile: Coach }, null] | [null, NextResponse]
> {
  try {
    const context = await requireCoach()
    return [context, null]
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Coach authentication failed'

    if (message.includes('Unauthorized') || message.includes('Requires coach role')) {
      return [null, apiError('Unauthorized: Coach role required', 403)]
    }
    if (message.includes('not found')) {
      return [null, apiError('Coach profile not found', 404)]
    }
    return [null, apiError(message, 500)]
  }
}

// ============================================================================
// Response Helpers
// ============================================================================

/**
 * Return a successful JSON response.
 *
 * @example
 * ```ts
 * return apiSuccess({ user: dbUser })
 * return apiSuccess({ player }, 201) // Created
 * ```
 */
export function apiSuccess<T = any>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status })
}

/**
 * Return an error JSON response.
 *
 * @example
 * ```ts
 * return apiError('Player not found', 404)
 * return apiError('Invalid input', 400)
 * ```
 */
export function apiError(message: string, status: number = 500): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Return a validation error response (400).
 *
 * @example
 * ```ts
 * return apiValidationError('playerId is required')
 * ```
 */
export function apiValidationError(message: string): NextResponse {
  return apiError(message, 400)
}

/**
 * Return an unauthorized error response (401).
 *
 * @example
 * ```ts
 * return apiUnauthorized()
 * return apiUnauthorized('Invalid token')
 * ```
 */
export function apiUnauthorized(message: string = 'Unauthorized'): NextResponse {
  return apiError(message, 401)
}

/**
 * Return a forbidden error response (403).
 *
 * @example
 * ```ts
 * return apiForbidden('You cannot edit this profile')
 * ```
 */
export function apiForbidden(message: string = 'Forbidden'): NextResponse {
  return apiError(message, 403)
}

/**
 * Return a not found error response (404).
 *
 * @example
 * ```ts
 * return apiNotFound('Player not found')
 * ```
 */
export function apiNotFound(message: string = 'Not found'): NextResponse {
  return apiError(message, 404)
}

// ============================================================================
// Error Handler Wrapper
// ============================================================================

/**
 * Wrap an API handler with automatic error handling.
 *
 * @example
 * ```ts
 * export const GET = handleApiError(async () => {
 *   const [auth, authError] = await withAuth()
 *   if (authError) return authError
 *
 *   // If this throws, it's automatically caught and returned as 500
 *   const data = await someOperation()
 *   return apiSuccess(data)
 * })
 * ```
 */
export function handleApiError<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
): (...args: T) => Promise<NextResponse> {
  return async (...args: T) => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)
      const message = error instanceof Error ? error.message : 'Internal server error'
      return apiError(message, 500)
    }
  }
}

// ============================================================================
// Request Body Helpers
// ============================================================================

/**
 * Safely parse JSON request body.
 * Returns tuple of [data, error response].
 *
 * @example
 * ```ts
 * const [body, bodyError] = await parseJsonBody<{ playerId: number }>(req)
 * if (bodyError) return bodyError
 *
 * const { playerId } = body
 * ```
 */
export async function parseJsonBody<T = any>(
  req: Request
): Promise<[T, null] | [null, NextResponse]> {
  try {
    const body = await req.json() as T
    return [body, null]
  } catch {
    return [null, apiValidationError('Invalid JSON in request body')]
  }
}

/**
 * Safely parse FormData request body.
 * Returns tuple of [formData, error response].
 *
 * @example
 * ```ts
 * const [formData, formError] = await parseFormData(req)
 * if (formError) return formError
 *
 * const name = formData.get('name')
 * ```
 */
export async function parseFormData(
  req: Request
): Promise<[FormData, null] | [null, NextResponse]> {
  try {
    const formData = await req.formData()
    return [formData, null]
  } catch {
    return [null, apiValidationError('Invalid FormData in request body')]
  }
}
