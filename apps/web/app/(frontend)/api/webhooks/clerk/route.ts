import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { findOne, create, updateById, deleteById, findAll } from '@/lib/payload-helpers'
import { deleteProfileImage } from '@/lib/blob-storage'
import { markInvitationUsed } from '@/actions/invitation-actions'

/**
 * Generate a secure random password for Clerk-synced users.
 * These users authenticate via Clerk, so the password is only needed
 * to satisfy Payload's auth requirements (they never use it).
 */
function generateRandomPassword(): string {
  return Math.random().toString(36).slice(2) +
         Math.random().toString(36).slice(2) +
         Math.random().toString(36).slice(2)
}

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const {
      id,
      email_addresses,
      public_metadata,
      unsafe_metadata,
      first_name,
      last_name,
    } = evt.data

    try {
      const email = email_addresses?.[0]?.email_address
      console.log(`📧 Email from Clerk: ${email}`)
      if (!email) {
        console.error('❌ No email address found')
        return new Response('No email address found', { status: 400 })
      }

      // Determine role from unsafe_metadata (set during signup) or public_metadata
      let role: 'player' | 'coach' | null = null
      let invitationToken: string | null = null
      let promoCode: string | null = null

      if (public_metadata?.role) {
        role = public_metadata.role as 'player' | 'coach'
      } else if (unsafe_metadata?.role) {
        const userRole = unsafe_metadata.role
        if (userRole === 'player' || userRole === 'coach') {
          role = userRole
        }
      }

      // Extract invitation token and promo code from metadata
      if (unsafe_metadata?.invitationToken) {
        invitationToken = unsafe_metadata.invitationToken as string
      }
      if (unsafe_metadata?.promoCode) {
        promoCode = unsafe_metadata.promoCode as string
      }

      // CRITICAL: Role MUST exist for user creation
      if (!role) {
        console.error(
          `❌ CRITICAL: No role found for user ${id}. Cannot create user without role.`
        )
        return new Response(
          'No role specified. User must register with a role.',
          { status: 400 }
        )
      }

      console.log(`🔍 Processing user.created for ${id}, role: ${role}`)

      // Update Clerk user's publicMetadata with the role and clear unsafeMetadata
      try {
        const client = await clerkClient()
        await client.users.updateUserMetadata(id, {
          publicMetadata: {
            role,
            ...(invitationToken && { invitationToken }),
            ...(promoCode && { promoCode }),
          },
          unsafeMetadata: {},
        })
        console.log(`✅ Updated Clerk publicMetadata and cleared unsafeMetadata for ${id}`)
      } catch (error) {
        console.error('❌ Error updating Clerk metadata:', error)
        throw error
      }

      // Check if user already exists (in case of webhook retries or race conditions)
      const existingUser = await findOne('users', {
        clerkId: { equals: id },
      })

      if (existingUser) {
        console.log(`⚠️ User ${id} already exists, updating role to ensure consistency`)

        // CRITICAL: Update the role to fix any corruption from race conditions
        // This ensures Clerk and PayloadCMS roles stay in sync
        await updateById('users', existingUser.id, {
          roles: [role],
          firstName: first_name || existingUser.firstName,
          lastName: last_name || existingUser.lastName,
          email: email || existingUser.email,
        }, {
          overrideAccess: true, // Webhook bypasses access control
        })

        console.log(`✅ User ${id} role updated to: ${role}`)
        return new Response('User role updated', { status: 200 })
      }

      // Defensive: Verify user still exists in Clerk before creating
      // This prevents orphaned Payload users from delayed webhook retries
      try {
        const client = await clerkClient()
        await client.users.getUser(id)
      } catch {
        console.log(`⚠️ User ${id} no longer exists in Clerk, skipping creation`)
        return new Response('User no longer exists in Clerk', { status: 200 })
      }

      // Create user with role as array
      try {
        const userData = {
          email,
          clerkId: id,
          roles: [role],
          firstName: first_name,
          lastName: last_name,
          password: generateRandomPassword(), // Required by Payload auth, not used by Clerk users
        }
        console.log('📝 Creating user with data:', JSON.stringify(userData, null, 2))

        await create('users', userData, {
          overrideAccess: true, // Webhook bypasses access control
          disableVerificationEmail: true, // Clerk handles email verification
        })
        console.log(`✅ User ${id} created with role: ${role}`)

        // Mark invitation as used if token exists
        if (invitationToken) {
          try {
            await markInvitationUsed(invitationToken, id)
            console.log(`✅ Marked invitation ${invitationToken} as used by ${id}`)
          } catch (error) {
            console.error('❌ Error marking invitation as used:', error)
            // Don't throw - user is already created, this is best-effort
          }
        }
      } catch (error) {
        console.error('❌ Error creating user:', error)
        if (error && typeof error === 'object' && 'data' in error) {
          console.error('Error data:', JSON.stringify(error.data, null, 2))
        }
        throw error
      }
    } catch (error) {
      console.error('❌ Error in user.created handler:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      return new Response(
        JSON.stringify({
          error: 'Error creating user',
          details: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, public_metadata, first_name, last_name } =
      evt.data

    try {
      const email = email_addresses?.[0]?.email_address
      if (!email) {
        return new Response('No email address found', { status: 400 })
      }

      // Find the user by clerkId
      const existingUser = await findOne('users', {
        clerkId: { equals: id },
      })

      // Get role from public_metadata
      const role = public_metadata?.role

      if (!role) {
        throw new Error('No role found in public_metadata')
      }

      if (!existingUser) {
        console.log(`User ${id} not found, creating...`)

        // Defensive: Verify user still exists in Clerk before creating
        // This prevents orphaned Payload users from delayed webhook retries
        try {
          const client = await clerkClient()
          await client.users.getUser(id)
        } catch {
          console.log(`⚠️ User ${id} no longer exists in Clerk, skipping creation`)
          return new Response('User no longer exists in Clerk', { status: 200 })
        }

        await create('users', {
          email,
          clerkId: id,
          roles: [role],
          firstName: first_name,
          lastName: last_name,
          password: generateRandomPassword(), // Required by Payload auth, not used by Clerk users
        }, {
          overrideAccess: true, // Webhook bypasses access control
          disableVerificationEmail: true, // Clerk handles email verification
        })
      } else {
        // Update the user
        await updateById('users', existingUser.id, {
          email,
          roles: [role],
          firstName: first_name || existingUser.firstName,
          lastName: last_name || existingUser.lastName,
        }, {
          overrideAccess: true, // Webhook bypasses access control
        })
      }

      console.log(`✅ User ${id} updated`)
    } catch (error) {
      console.error('Error updating user:', error)
      if (error && typeof error === 'object' && 'data' in error) {
        console.error('Error data:', JSON.stringify(error.data, null, 2))
      }
      return new Response('Error updating user', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      console.log(`🗑️  User deleted from Clerk: ${id}`)

      // Find the user
      const user = await findOne('users', {
        clerkId: { equals: id as string },
      })

      if (!user) {
        console.log(`No user found for Clerk ID: ${id}`)
        return new Response('', { status: 200 })
      }

      // CASCADE DELETE: Find and delete player profile if exists
      const playerProfiles = await findAll('players', {
        user: { equals: user.id },
      })

      if (playerProfiles.length > 0) {
        for (const player of playerProfiles) {
          // Delete profile image from Vercel Blob if it exists
          if (player.profileImageUrl) {
            await deleteProfileImage(player.profileImageUrl)
            console.log(`✅ Deleted profile image for player: ${player.id}`)
          }

          await deleteById('players', player.id)
          console.log(`✅ Deleted player profile: ${player.id}`)
        }
      }

      // CASCADE DELETE: Find and delete coach profile if exists
      const coachProfiles = await findAll('coaches', {
        user: { equals: user.id },
      })

      if (coachProfiles.length > 0) {
        for (const coach of coachProfiles) {
          // Delete all prospects created by this coach
          const prospects = await findAll('coach-prospects', {
            coach: { equals: coach.id },
          })

          for (const prospect of prospects) {
            await deleteById('coach-prospects', prospect.id)
            console.log(`✅ Deleted prospect: ${prospect.id}`)
          }

          // Delete all saved players by this coach
          const savedPlayers = await findAll('coach-saved-players', {
            coach: { equals: coach.id },
          })

          for (const savedPlayer of savedPlayers) {
            await deleteById('coach-saved-players', savedPlayer.id)
          }
          console.log(`✅ Deleted saved players for coach: ${coach.id}`)

          // Delete all coach notes
          const notes = await findAll('coach-player-notes', {
            coach: { equals: coach.id },
          })

          for (const note of notes) {
            await deleteById('coach-player-notes', note.id)
          }
          console.log(`✅ Deleted coach notes for coach: ${coach.id}`)

          // Delete profile image from Vercel Blob if it exists
          if (coach.profileImageUrl) {
            await deleteProfileImage(coach.profileImageUrl)
            console.log(`✅ Deleted profile image for coach: ${coach.id}`)
          }

          // Delete coach profile
          await deleteById('coaches', coach.id)
          console.log(`✅ Deleted coach profile: ${coach.id}`)
        }
      }

      // Finally, delete the user
      await deleteById('users', user.id)

      console.log(`✅ Deleted user: ${user.id}`)
    } catch (error) {
      console.error('Error deleting user:', error)
      return new Response('Error deleting user', { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}
