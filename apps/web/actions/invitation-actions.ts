'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'

export interface Invitation {
  id: string | number
  token: string
  role: 'player' | 'coach'
  promoCode: string
  invitedEmail?: string
  expiresAt?: string
  redeemedAt?: string
  redeemedBy?: string
}

export async function validateInvitation(token: string): Promise<Invitation> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'invitations',
    where: {
      token: {
        equals: token,
      },
    },
    limit: 1,
  })

  const invitation = result.docs[0]

  if (!invitation) {
    throw new Error('Invitation not found')
  }

  if (invitation.redeemedAt) {
    throw new Error('This invitation has already been used')
  }

  if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
    throw new Error('This invitation has expired')
  }

  return {
    id: invitation.id,
    token: invitation.token,
    role: invitation.role as 'player' | 'coach',
    promoCode: invitation.promoCode,
    invitedEmail: invitation.invitedEmail || undefined,
    expiresAt: invitation.expiresAt || undefined,
    redeemedAt: invitation.redeemedAt || undefined,
    redeemedBy: typeof invitation.redeemedBy === 'string' ? invitation.redeemedBy : undefined,
  }
}

export async function markInvitationUsed(token: string, clerkUserId: string): Promise<void> {
  const payload = await getPayload({ config })

  // Find the invitation
  const result = await payload.find({
    collection: 'invitations',
    where: {
      token: {
        equals: token,
      },
    },
    limit: 1,
  })

  const invitation = result.docs[0]

  if (!invitation) {
    throw new Error('Invitation not found')
  }

  if (invitation.redeemedAt) {
    // Already redeemed, this is fine (idempotent)
    return
  }

  // Find or create the user in Payload
  const userResult = await payload.find({
    collection: 'users',
    where: {
      clerkId: {
        equals: clerkUserId,
      },
    },
    limit: 1,
  })

  const payloadUserId = userResult.docs[0]?.id

  // Mark as redeemed
  await payload.update({
    collection: 'invitations',
    id: invitation.id,
    data: {
      redeemedAt: new Date().toISOString(),
      redeemedBy: payloadUserId || undefined,
    },
  })
}

export async function checkEmailLock(token: string, email: string): Promise<boolean> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'invitations',
    where: {
      token: {
        equals: token,
      },
    },
    limit: 1,
  })

  const invitation = result.docs[0]

  if (!invitation) {
    return false
  }

  // If no email lock, allow any email
  if (!invitation.invitedEmail) {
    return true
  }

  // Check if email matches
  return invitation.invitedEmail.toLowerCase() === email.toLowerCase()
}
