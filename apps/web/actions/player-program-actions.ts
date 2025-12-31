'use server'

import { currentUser } from '@clerk/nextjs/server'
import { findOne, findAll, create, deleteById } from '@/lib/payload-helpers'
import { revalidatePath } from 'next/cache'

/**
 * Save a college program to a player's list
 */
export async function saveProgram(collegeId: number) {
  const user = await currentUser()

  if (!user) {
    throw new Error('You must be signed in to save programs')
  }

  // Verify user is a player
  if (user.publicMetadata?.role !== 'player') {
    throw new Error('Only players can save programs')
  }

  // Get the player record
  const payloadUser = await findOne('users', {
    clerkId: { equals: user.id },
  })

  if (!payloadUser) {
    throw new Error('User not found')
  }

  const playerRecords = await findAll('players', {
    user: { equals: payloadUser.id },
  })

  const player = playerRecords[0]

  if (!player) {
    throw new Error('Player profile not found')
  }

  // Check if already saved
  const existing = await findAll('player-saved-programs', {
    player: { equals: player.id },
    college: { equals: collegeId },
  })

  // If already saved, just return (idempotent operation)
  if (existing.length > 0) {
    return
  }

  // Create saved program
  await create('player-saved-programs', {
    player: player.id,
    college: collegeId,
    savedAt: new Date().toISOString(),
  })

  revalidatePath('/')
  revalidatePath('/programs')
  revalidatePath(`/programs/${collegeId}`)
}

/**
 * Remove a saved program from a player's list
 */
export async function unsaveProgram(collegeId: number) {
  const user = await currentUser()

  if (!user) {
    throw new Error('You must be signed in to unsave programs')
  }

  // Get the player record
  const payloadUser = await findOne('users', {
    clerkId: { equals: user.id },
  })

  if (!payloadUser) {
    throw new Error('User not found')
  }

  const playerRecords = await findAll('players', {
    user: { equals: payloadUser.id },
  })

  const player = playerRecords[0]

  if (!player) {
    throw new Error('Player profile not found')
  }

  // Find and delete saved program
  const saved = await findAll('player-saved-programs', {
    player: { equals: player.id },
    college: { equals: collegeId },
  })

  // If not saved, just return (idempotent operation)
  if (saved.length === 0) {
    return
  }

  await deleteById('player-saved-programs', saved[0]!.id)

  revalidatePath('/')
  revalidatePath('/programs')
  revalidatePath(`/programs/${collegeId}`)
}

/**
 * Check if a player has saved a specific program
 */
export async function isProgramSaved(collegeId: number): Promise<boolean> {
  const user = await currentUser()

  if (!user || user.publicMetadata?.role !== 'player') {
    return false
  }

  const payloadUser = await findOne('users', {
    clerkId: { equals: user.id },
  })

  if (!payloadUser) return false

  const playerRecords = await findAll('players', {
    user: { equals: payloadUser.id },
  })

  const player = playerRecords[0]
  if (!player) return false

  const saved = await findAll('player-saved-programs', {
    player: { equals: player.id },
    college: { equals: collegeId },
  })

  return saved.length > 0
}
