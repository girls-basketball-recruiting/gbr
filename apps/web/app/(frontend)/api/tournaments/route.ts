import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET() {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Fetch all tournaments
    const tournaments = await payload.find({
      collection: 'tournaments',
      limit: 1000,
      sort: 'startDate',
    })

    // For each tournament, count how many players are attending
    const tournamentsWithCounts = await Promise.all(
      tournaments.docs.map(async (tournament) => {
        // Find all players who have this tournament in their schedule
        const playersAttending = await payload.find({
          collection: 'players',
          where: {
            tournamentSchedule: {
              contains: tournament.id,
            },
            deletedAt: {
              exists: false,
            },
          },
          limit: 0, // We only need the total count
        })

        return {
          id: tournament.id,
          name: tournament.name,
          location: tournament.location,
          startDate: tournament.startDate,
          endDate: tournament.endDate,
          description: tournament.description,
          website: tournament.website,
          attendeeCount: playersAttending.totalDocs,
        }
      }),
    )

    return NextResponse.json({ tournaments: tournamentsWithCounts })
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 },
    )
  }
}
