import { currentUser } from '@clerk/nextjs/server'
import { apiSuccess, handleApiError } from '@/lib/api-helpers'
import { exists, findOne } from '@/lib/payload-helpers'

/**
 * Check if user has completed onboarding
 * This route does not require authentication - returns hasProfile: false if not logged in
 */
export const GET = handleApiError(async () => {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return apiSuccess({ hasProfile: false, role: null })
  }

  // Check if user exists in database
  const dbUser = await findOne('users', {
    clerkId: { equals: clerkUser.id },
  })

  // If no database user exists, they need to complete onboarding
  if (!dbUser) {
    const role = (clerkUser.publicMetadata?.role as string) || null
    return apiSuccess({ hasProfile: false, role })
  }

  // Get role from Clerk publicMetadata (single source of truth)
  const role = (clerkUser.publicMetadata?.role as string) || null

  // Check if they have a player or coach profile
  if (role === 'player') {
    const hasProfile = await exists('players', {
      and: [
        { user: { equals: dbUser.id } },
        { deletedAt: { exists: false } },
      ],
    })

    console.log(
      `[check-onboarding] Player check for user ${dbUser.id}: hasProfile=${hasProfile}`
    )
    return apiSuccess({ hasProfile, role })
  }

  if (role === 'coach') {
    const hasProfile = await exists('coaches', {
      and: [
        { user: { equals: dbUser.id } },
        { deletedAt: { exists: false } },
      ],
    })

    console.log(
      `[check-onboarding] Coach check for user ${dbUser.id}: hasProfile=${hasProfile}`
    )
    return apiSuccess({ hasProfile, role })
  }

  // Admin or unknown role - allow access
  return apiSuccess({ hasProfile: true, role })
})
