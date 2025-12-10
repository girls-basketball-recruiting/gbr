import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ coachId: string; playerId: string }> },
) {
  try {
    const { coachId, playerId } = await params
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Verify user is a coach
    const users = await payload.find({
      collection: 'users',
      where: {
        clerkId: {
          equals: clerkUser.id,
        },
      },
    })

    if (users.docs.length === 0 || !users.docs[0].roles?.includes('coach')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find existing notes
    const notes = await payload.find({
      collection: 'coach-player-notes',
      where: {
        and: [
          {
            coach: {
              equals: parseInt(coachId),
            },
          },
          {
            player: {
              equals: parseInt(playerId),
            },
          },
        ],
      },
    })

    if (notes.docs.length === 0) {
      return NextResponse.json(
        {
          notes: '',
          contactRecords: [],
        },
        { status: 200 },
      )
    }

    return NextResponse.json(notes.docs[0], { status: 200 })
  } catch (error) {
    console.error('Error fetching coach notes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ coachId: string; playerId: string }> },
) {
  try {
    const { coachId, playerId } = await params
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Verify user is a coach
    const users = await payload.find({
      collection: 'users',
      where: {
        clerkId: {
          equals: clerkUser.id,
        },
      },
    })

    if (users.docs.length === 0 || !users.docs[0].roles?.includes('coach')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    // Sanitize contact records - convert empty strings to undefined for date fields
    const sanitizedContactRecords = (body.contactRecords || []).map(
      (record: any) => ({
        ...record,
        date: record.date === '' ? undefined : record.date,
        followUpDate:
          record.followUpDate === '' ? undefined : record.followUpDate,
      }),
    )

    // Find existing notes
    const existingNotes = await payload.find({
      collection: 'coach-player-notes',
      where: {
        and: [
          {
            coach: {
              equals: parseInt(coachId),
            },
          },
          {
            player: {
              equals: parseInt(playerId),
            },
          },
        ],
      },
    })

    let result

    if (existingNotes.docs.length === 0) {
      // Create new notes
      result = await payload.create({
        collection: 'coach-player-notes',
        data: {
          coach: parseInt(coachId),
          player: parseInt(playerId),
          notes: body.notes || '',
          contactRecords: sanitizedContactRecords,
          interestLevel: body.interestLevel || undefined,
        },
      })
    } else {
      // Update existing notes
      result = await payload.update({
        collection: 'coach-player-notes',
        id: existingNotes.docs[0].id,
        data: {
          notes: body.notes,
          contactRecords: sanitizedContactRecords,
          interestLevel: body.interestLevel || undefined,
        },
      })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error saving coach notes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
