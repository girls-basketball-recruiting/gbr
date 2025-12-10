import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

/**
 * Syncs the current Clerk user to PayloadCMS if they don't exist
 * This is useful for ensuring a user exists when they first access the app
 * @returns The PayloadCMS user object
 */
export async function syncClerkUser() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Check if user exists in PayloadCMS
  const existingUsers = await payload.find({
    collection: 'users',
    where: {
      clerkId: {
        equals: clerkUser.id,
      },
    },
  })

  if (existingUsers.docs.length > 0) {
    // User already exists, return it
    return existingUsers.docs[0]
  }

  // User doesn't exist, create them
  const rawRoles = (clerkUser.publicMetadata?.roles as string[]) || ['player']
  const roles = rawRoles.filter((r): r is 'admin' | 'player' | 'coach' =>
    ['admin', 'player', 'coach'].includes(r),
  )

  const email = clerkUser.emailAddresses?.[0]?.emailAddress
  if (!email) {
    throw new Error('No email address found for user')
  }

  const newUser = await payload.create({
    collection: 'users',
    data: {
      email,
      clerkId: clerkUser.id,
      roles,
      firstName: clerkUser.firstName || undefined,
      lastName: clerkUser.lastName || undefined,
      password:
        Math.random().toString(36).slice(-12) +
        Math.random().toString(36).slice(-12),
    },
  })

  console.log(`✅ User ${clerkUser.id} synced to PayloadCMS`)

  return newUser
}

/**
 * Gets the PayloadCMS user for the current Clerk user
 * @returns The PayloadCMS user object or null
 */
export async function getPayloadUserFromClerk() {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const users = await payload.find({
    collection: 'users',
    where: {
      clerkId: {
        equals: clerkUser.id,
      },
    },
  })

  return users.docs[0] || null
}
