import 'dotenv/config'
import { writeFileSync } from 'fs'

// All regions from acahoops.com
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

// Raw tournament data from API
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
  // Additional fields we don't use but are in the response
  GenderDropdown: string
  Ages: string
  Talent: string
  Cost: string
  ContactOrg: string
  Contact: string
  Email: string
  Telephone: string
}

// Normalized tournament for our database
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

// Extract city from Location field
// Handles: "Pittsburgh, PA" -> "Pittsburgh", "Pittsburgh" -> "Pittsburgh"
function extractCity(location: string): string {
  if (!location) return ''
  const parts = location.split(',')
  return parts[0]?.trim() || location.trim()
}

// Fetch tournaments from a single region with pagination
async function fetchRegion(region: string, limit?: number): Promise<AcaHoopsTournament[]> {
  const tournaments: AcaHoopsTournament[] = []
  let skip = 0
  const batchSize = 100
  let totalRecords = 0
  let isFirstBatch = true

  while (true) {
    const url = `https://www.acahoops.com/api/Utility?GenderDropdown=girls&ListingType=tournament&Region=${region}&limit=${batchSize}&skip=${skip}&request=listings`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${region}: ${response.status} ${response.statusText}`)
    }

    const data: AcaHoopsTournament[] = await response.json()

    if (data.length === 0) break

    // Get total count from first record
    if (isFirstBatch && data[0]) {
      totalRecords = data[0].TotalRecordsCount
      isFirstBatch = false
    }

    tournaments.push(...data)

    console.log(`  ${region}: ${tournaments.length}/${totalRecords}`)

    // Check if we've hit the limit
    if (limit && tournaments.length >= limit) {
      return tournaments.slice(0, limit)
    }

    // Check if we've fetched all records
    if (tournaments.length >= totalRecords) break

    skip += batchSize

    // Small delay to be respectful to the API
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return tournaments
}

// Transform API response to our format
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

async function main() {
  console.log('🏀 Starting tournament fetch from acahoops.com...\n')

  // Parse command line args
  const args = process.argv.slice(2)
  const limitIndex = args.indexOf('--limit')
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]!, 10) : undefined

  if (limit) {
    console.log(`⚠️  Limit set to ${limit} tournaments (testing mode)\n`)
  }

  const allTournaments: Tournament[] = []
  let totalFetched = 0

  for (const region of REGIONS) {
    console.log(`📍 Fetching ${region}...`)

    // Calculate remaining limit for this region
    const regionLimit = limit ? limit - totalFetched : undefined

    if (limit && totalFetched >= limit) {
      console.log(`  Skipping (limit reached)`)
      continue
    }

    try {
      const rawTournaments = await fetchRegion(region, regionLimit)
      const tournaments = rawTournaments.map(transformTournament)
      allTournaments.push(...tournaments)
      totalFetched += tournaments.length

      console.log(`  ✓ Got ${tournaments.length} tournaments\n`)
    } catch (error) {
      console.error(`  ✗ Error fetching ${region}:`, error)
    }

    if (limit && totalFetched >= limit) {
      console.log(`\n⚠️  Reached limit of ${limit} tournaments`)
      break
    }
  }

  // Deduplicate by sourceId (in case of any overlap)
  const uniqueTournaments = Array.from(
    new Map(allTournaments.map(t => [t.sourceId, t])).values()
  )

  console.log(`\n📊 Summary:`)
  console.log(`   Total fetched: ${allTournaments.length}`)
  console.log(`   Unique tournaments: ${uniqueTournaments.length}`)

  // Save to file
  const output = {
    tournaments: uniqueTournaments,
    metadata: {
      lastUpdated: new Date().toISOString(),
      totalCount: uniqueTournaments.length,
      source: 'acahoops.com',
      regions: REGIONS,
    },
  }

  const outputFile = 'tournaments-data.json'
  writeFileSync(outputFile, JSON.stringify(output, null, 2))
  console.log(`\n💾 Saved to ${outputFile}`)

  console.log('\n🎉 Fetch complete!')
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
