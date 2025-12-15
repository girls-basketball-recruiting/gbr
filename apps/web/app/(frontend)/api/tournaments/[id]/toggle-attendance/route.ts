import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { currentUser } from '@clerk/nextjs/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: tournamentId } = await params
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only players can mark attendance
    if (clerkUser.publicMetadata?.role !== 'player') {
      return NextResponse.json(
        { error: 'Only players can mark tournament attendance' },
        { status: 403 },
      )
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

    // Find the player profile
    const players = await payload.find({
      collection: 'players',
      where: {
        user: {
          equals: payloadUser.id,
        },
      },
    })

    if (players.docs.length === 0) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 },
      )
    }

    const player = players.docs[0]!

    // Get current tournament schedule
    const currentSchedule = Array.isArray(player.tournamentSchedule)
      ? player.tournamentSchedule.map((t: any) =>
          typeof t === 'object' ? t.id : t,
        )
      : []

    // Toggle tournament in schedule
    const tournamentIdNum = parseInt(tournamentId)
    const isCurrentlyAttending = currentSchedule.includes(tournamentIdNum)

    const updatedSchedule = isCurrentlyAttending
      ? currentSchedule.filter((id: number) => id !== tournamentIdNum)
      : [...currentSchedule, tournamentIdNum]

    // Update player
    await payload.update({
      collection: 'players',
      id: player.id,
      data: {
        tournamentSchedule: updatedSchedule,
      },
    })

    return NextResponse.json({
      success: true,
      isAttending: !isCurrentlyAttending,
    })
  } catch (error) {
    console.error('Error toggling tournament attendance:', error)
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 },
    )
  }
}
