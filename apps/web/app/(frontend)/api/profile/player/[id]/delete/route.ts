import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Find the PayloadCMS user
    const users = await payload.find({
      collection: 'users',
      where: {
        clerkId: {
          equals: clerkUser.id,
        },
      },
    })

    if (users.docs.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const payloadUser = users.docs[0]!

    // Verify the player profile belongs to this user
    const playerProfile = await payload.findByID({
      collection: 'players',
      id: parseInt(id),
      depth: 0,
    })

    if (!playerProfile || playerProfile.user !== payloadUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this profile' },
        { status: 403 }
      )
    }

    // Soft delete: set deletedAt timestamp
    await payload.update({
      collection: 'players',
      id: parseInt(id),
      data: {
        deletedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({ success: true, deleted: true })
  } catch (error) {
    console.error('Error deleting player profile:', error)
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    )
  }
}
