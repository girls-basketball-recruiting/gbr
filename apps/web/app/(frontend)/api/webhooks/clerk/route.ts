import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error occured -- no svix headers', {
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
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Get PayloadCMS instance
  const payloadConfig = await config
  const payloadClient = await getPayload({ config: payloadConfig })

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
      // Determine role from unsafe_metadata (set during signup) or public_metadata
      let role: 'player' | 'coach' | 'admin' = 'player' // Default

      if (public_metadata?.role) {
        role = public_metadata.role as 'player' | 'coach' | 'admin'
      } else if (unsafe_metadata?.userType) {
        const userType = (unsafe_metadata as any).userType
        if (userType === 'player' || userType === 'coach') {
          role = userType
        }
      }

      // Update Clerk user's publicMetadata with the role
      const client = await clerkClient()
      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          role,
        },
      })

      const email = email_addresses?.[0]?.email_address
      if (!email) {
        return new Response('No email address found', { status: 400 })
      }

      // Create user in PayloadCMS with role as array (PayloadCMS expects array)
      await payloadClient.create({
        collection: 'users',
        data: {
          email,
          clerkId: id,
          roles: [role], // PayloadCMS uses array for roles
          firstName: first_name || undefined,
          lastName: last_name || undefined,
          // PayloadCMS requires a password, but we won't use it since auth is handled by Clerk
          password:
            Math.random().toString(36).slice(-12) +
            Math.random().toString(36).slice(-12),
        },
      })

      console.log(`✅ User ${id} created in PayloadCMS with role: ${role}`)
    } catch (error) {
      console.error('Error creating user in PayloadCMS:', error)
      return new Response('Error creating user', { status: 500 })
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
      const users = await payloadClient.find({
        collection: 'users',
        where: {
          clerkId: {
            equals: id,
          },
        },
      })

      // Get role from public_metadata
      const role =
        (public_metadata?.role as 'player' | 'coach' | 'admin') || 'player'

      if (users.docs.length === 0) {
        console.log(`User ${id} not found in PayloadCMS, creating...`)

        await payloadClient.create({
          collection: 'users',
          data: {
            email,
            clerkId: id,
            roles: [role], // PayloadCMS uses array for roles
            firstName: first_name || undefined,
            lastName: last_name || undefined,
            password:
              Math.random().toString(36).slice(-12) +
              Math.random().toString(36).slice(-12),
          },
        })
      } else {
        // Update the user
        const userId = users.docs[0]?.id
        if (!userId) {
          throw new Error('User ID is missing')
        }

        await payloadClient.update({
          collection: 'users',
          id: userId,
          data: {
            email,
            roles: [role], // PayloadCMS uses array for roles
            firstName: first_name || undefined,
            lastName: last_name || undefined,
          },
        })
      }

      console.log(`✅ User ${id} updated in PayloadCMS`)
    } catch (error) {
      console.error('Error updating user in PayloadCMS:', error)
      return new Response('Error updating user', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    try {
      // Find and delete the user by clerkId
      const users = await payloadClient.find({
        collection: 'users',
        where: {
          clerkId: {
            equals: id as string,
          },
        },
      })

      if (users.docs.length > 0) {
        const userId = users.docs[0]?.id
        if (userId) {
          await payloadClient.delete({
            collection: 'users',
            id: userId,
          })
          console.log(`✅ User ${id} deleted from PayloadCMS`)
        }
      }
    } catch (error) {
      console.error('Error deleting user from PayloadCMS:', error)
      return new Response('Error deleting user', { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}
