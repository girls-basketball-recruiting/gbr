import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Regions from acahoops.com
const REGIONS = [
  'mid-atlantic',
  'new-england',
  'mid-south',
  'great-lakes',
  'deep-south',
  'south-central',
  'southwest',
  'upper-plains',
  'northwest',
  'pacific-west',
  'western-canada',
  'eastern-canada',
] as const

interface AcaHoopsTournament {
  ID: number
  Tournament: string
  State: string
  Location: string
  StartDate: string
  EndDate: string
  Notes: string | null
  Website: string | null
  TotalRecordsCount: number
}

interface Tournament {
  sourceId: string
  name: string
  city: string
  state: string
  startDate: string
  endDate: string
  description: string | null
  website: string | null
}

function extractCity(location: string): string {
  if (!location) return ''
  const parts = location.split(',')
  return parts[0]?.trim() || location.trim()
}

function transformTournament(raw: AcaHoopsTournament): Tournament {
  return {
    sourceId: `acahoops-${raw.ID}`,
    name: raw.Tournament,
    city: extractCity(raw.Location),
    state: raw.State,
    startDate: raw.StartDate,
    endDate: raw.EndDate,
    description: raw.Notes || null,
    website: raw.Website || null,
  }
}

async function fetchRegion(region: string): Promise<AcaHoopsTournament[]> {
  const tournaments: AcaHoopsTournament[] = []
  let skip = 0
  const batchSize = 100
  let totalRecords = 0
  let isFirstBatch = true

  while (true) {
    const url = `https://www.acahoops.com/api/Utility?GenderDropdown=girls&ListingType=tournament&Region=${region}&limit=${batchSize}&skip=${skip}&request=listings`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${region}: ${response.status}`)
    }

    const data: AcaHoopsTournament[] = await response.json()
    if (data.length === 0) break

    if (isFirstBatch && data[0]) {
      totalRecords = data[0].TotalRecordsCount
      isFirstBatch = false
    }

    tournaments.push(...data)

    if (tournaments.length >= totalRecords) break
    skip += batchSize

    // Small delay to be respectful
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  return tournaments
}

export async function POST(request: NextRequest) {
  try {
    // Check authorization - either PayloadCMS admin or cron secret
    const cronSecret = request.headers.get('x-cron-secret')
    const isValidCron = cronSecret === process.env.CRON_SECRET
    const payload = await getPayload({ config })

    if (!isValidCron) {
      // Check PayloadCMS auth (admin panel only)
      const { user: payloadUser } = await payload.auth({ headers: request.headers })

      if (!payloadUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (!payloadUser.roles?.includes('admin')) {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
      }
    }

    // Fetch all tournaments from acahoops
    console.log('Starting tournament scrape...')
    const allTournaments: Tournament[] = []

    for (const region of REGIONS) {
      console.log(`Fetching ${region}...`)
      const rawTournaments = await fetchRegion(region)
      const tournaments = rawTournaments.map(transformTournament)
      allTournaments.push(...tournaments)
      console.log(`Got ${tournaments.length} from ${region}`)
    }

    // Deduplicate
    const uniqueTournaments = Array.from(
      new Map(allTournaments.map(t => [t.sourceId, t])).values()
    )

    console.log(`Total unique tournaments: ${uniqueTournaments.length}`)

    // Get existing sourceIds
    const existingSourceIds = new Set<string>()
    let page = 1
    let hasMore = true

    while (hasMore) {
      const existing = await payload.find({
        collection: 'tournaments',
        where: { sourceId: { exists: true } },
        limit: 500,
        page,
      })

      for (const doc of existing.docs) {
        if (doc.sourceId) {
          existingSourceIds.add(doc.sourceId)
        }
      }

      hasMore = existing.hasNextPage
      page++
    }

    // Filter to new tournaments only
    const newTournaments = uniqueTournaments.filter(t => !existingSourceIds.has(t.sourceId))

    console.log(`New tournaments to import: ${newTournaments.length}`)

    // Import new tournaments
    let imported = 0
    let failed = 0

    for (const tournament of newTournaments) {
      try {
        await payload.create({
          collection: 'tournaments',
          data: {
            name: tournament.name,
            city: tournament.city,
            state: tournament.state,
            startDate: tournament.startDate,
            endDate: tournament.endDate,
            description: tournament.description || undefined,
            website: tournament.website || undefined,
            sourceId: tournament.sourceId,
          },
          overrideAccess: true,
        })
        imported++
      } catch (error) {
        console.error(`Failed to import ${tournament.name}:`, error)
        failed++
      }
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        totalFetched: uniqueTournaments.length,
        existingCount: existingSourceIds.size,
        newTournaments: newTournaments.length,
        imported,
        failed,
        skipped: uniqueTournaments.length - newTournaments.length,
      },
    }

    console.log('Scrape complete:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500 }
    )
  }
}

// GET endpoint for status check
export async function GET() {
  return NextResponse.json({
    endpoint: 'Tournament Scraper',
    method: 'POST to trigger scrape',
    source: 'acahoops.com',
    regions: REGIONS,
  })
}
