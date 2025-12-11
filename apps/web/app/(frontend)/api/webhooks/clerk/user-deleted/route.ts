import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(req: Request) {
  try {
    // Verify the webhook signature
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
      throw new Error('CLERK_WEBHOOK_SECRET is not set')
    }

    const svix_id = req.headers.get('svix-id')
    const svix_timestamp = req.headers.get('svix-timestamp')
    const svix_signature = req.headers.get('svix-signature')

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: 'Missing headers' }, { status: 400 })
    }

    const body = await req.text()
    const wh = new Webhook(WEBHOOK_SECRET)

    let evt: any

    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      })
    } catch (err) {
      console.error('Webhook verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle user.deleted event
    if (evt.type === 'user.deleted') {
      const clerkId = evt.data.id

      console.log(`🗑️  User deleted from Clerk: ${clerkId}`)

      const payloadConfig = await config
      const payload = await getPayload({ config: payloadConfig })

      // Find the PayloadCMS user
      const users = await payload.find({
        collection: 'users',
        where: {
          clerkId: {
            equals: clerkId,
          },
        },
      })

      if (users.docs.length === 0) {
        console.log(`No PayloadCMS user found for Clerk ID: ${clerkId}`)
        return NextResponse.json({ received: true })
      }

      const payloadUser = users.docs[0]!

      // Find and delete player profile if exists
      const players = await payload.find({
        collection: 'players',
        where: {
          user: {
            equals: payloadUser.id,
          },
        },
      })

      if (players.docs.length > 0) {
        for (const player of players.docs) {
          await payload.delete({
            collection: 'players',
            id: player.id,
          })
          console.log(`✅ Deleted player profile: ${player.id}`)
        }
      }

      // Find and delete coach profile if exists
      const coaches = await payload.find({
        collection: 'coaches',
        where: {
          user: {
            equals: payloadUser.id,
          },
        },
      })

      if (coaches.docs.length > 0) {
        for (const coach of coaches.docs) {
          await payload.delete({
            collection: 'coaches',
            id: coach.id,
          })
          console.log(`✅ Deleted coach profile: ${coach.id}`)
        }
      }

      // Delete SavedPlayers where this user is referenced
      const savedPlayers = await payload.find({
        collection: 'saved-players',
        where: {
          coach: {
            equals: payloadUser.id,
          },
        },
      })

      for (const saved of savedPlayers.docs) {
        await payload.delete({
          collection: 'saved-players',
          id: saved.id,
        })
        console.log(`✅ Deleted saved player record: ${saved.id}`)
      }

      // Delete CoachPlayerNotes where this user is referenced
      const notes = await payload.find({
        collection: 'coach-player-notes',
        where: {
          coach: {
            equals: payloadUser.id,
          },
        },
      })

      for (const note of notes.docs) {
        await payload.delete({
          collection: 'coach-player-notes',
          id: note.id,
        })
        console.log(`✅ Deleted coach note: ${note.id}`)
      }

      // Finally, delete the PayloadCMS user
      await payload.delete({
        collection: 'users',
        id: payloadUser.id,
      })

      console.log(`✅ Deleted PayloadCMS user: ${payloadUser.id}`)

      return NextResponse.json({ received: true, deleted: true })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
