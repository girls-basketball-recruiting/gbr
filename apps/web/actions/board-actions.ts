'use server'

import { currentUser } from '@clerk/nextjs/server'
import { findOne, updateById } from '@/lib/payload-helpers'
import { revalidatePath } from 'next/cache'

export type BoardOrderItem = {
  type: 'prospect' | 'player'
  id: number
}

/**
 * Update the coach's recruiting board order
 */
export async function updateBoardOrder(newOrder: BoardOrderItem[]) {
  const user = await currentUser()

  if (!user) {
    throw new Error('You must be signed in to update board order')
  }

  // Verify user is a coach
  if (user.publicMetadata?.role !== 'coach') {
    throw new Error('Only coaches can update board order')
  }

  // Get the coach record
  const payloadUser = await findOne('users', {
    clerkId: { equals: user.id },
  })

  if (!payloadUser) {
    throw new Error('User not found')
  }

  const coach = await findOne('coaches', {
    user: { equals: payloadUser.id },
  })

  if (!coach) {
    throw new Error('Coach profile not found')
  }

  // Update the board order
  await updateById('coaches', coach.id, {
    boardOrder: newOrder,
  })

  revalidatePath('/')
}
