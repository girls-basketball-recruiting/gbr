import { findOne, findById, create, updateById } from '@/lib/payload-helpers'

/**
 * Get user from database by Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
  return findOne('users', {
    clerkId: { equals: clerkId }
  })
}

/**
 * Get user from database by email
 */
export async function getUserByEmail(email: string) {
  return findOne('users', {
    email: { equals: email }
  })
}

/**
 * Get user from database by ID
 */
export async function getUserById(id: number) {
  return findById('users', id)
}

/**
 * Create a new user
 */
export async function createUser(data: {
  email: string
  clerkId: string
  roles: Array<'admin' | 'player' | 'coach'>
  firstName?: string
  lastName?: string
}) {
  // Payload expects password for auth collections created via API?
  // Since we are using Clerk, we might need to handle this.
  // However, Payload's create API for auth collections usually requires email/password unless we disable auth or handle it.
  // But wait, the Users collection has `auth: true`.
  // If we create a user programmatically via Payload, we need a password if we want them to login via Payload.
  // But here we are using Clerk. The user likely won't login via Payload UI (except admins).
  // We can provide a dummy password.
  
  return create('users', {
    ...data,
    password: crypto.randomUUID(), // Dummy password since we use Clerk
  })
}

/**
 * Update a user
 */
export async function updateUser(
  id: number,
  data: Partial<{
    email: string
    roles: Array<'admin' | 'player' | 'coach'>
    firstName: string
    lastName: string
    stripeCustomerId: string
    stripeSubscriptionId: string
    stripePriceId: string
    stripeCurrentPeriodEnd: Date
  }>
) {
  return updateById('users', id, data)
}
