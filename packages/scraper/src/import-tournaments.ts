import 'dotenv/config'
import { readFileSync } from 'fs'
import { getPayload } from 'payload'
import config from '../../../apps/web/payload.config.js'

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

interface TournamentsData {
  tournaments: Tournament[]
  metadata: {
    lastUpdated: string
    totalCount: number
    source: string
  }
}

async function importTournaments() {
  console.log('🏀 Starting tournament import...\n')

  // Parse command line args
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n')
  }

  try {
    // Read the parsed data
    console.log('📄 Reading tournaments-data.json...')
    const data: TournamentsData = JSON.parse(readFileSync('tournaments-data.json', 'utf-8'))
    const tournaments = data.tournaments

    console.log(`Found ${tournaments.length} tournaments to process`)
    console.log(`Source: ${data.metadata.source}`)
    console.log(`Last updated: ${data.metadata.lastUpdated}\n`)

    // Get PayloadCMS instance
    console.log('🔌 Connecting to database...')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get existing sourceIds to check for duplicates
    console.log('🔍 Checking for existing tournaments...')
    const existingSourceIds = new Set<string>()
    let page = 1
    let hasMore = true

    while (hasMore) {
      const existing = await payload.find({
        collection: 'tournaments',
        where: {
          sourceId: { exists: true },
        },
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

    console.log(`Found ${existingSourceIds.size} existing tournaments with sourceId\n`)

    // Filter to only new tournaments
    const newTournaments = tournaments.filter(t => !existingSourceIds.has(t.sourceId))
    const skippedCount = tournaments.length - newTournaments.length

    console.log(`📊 Import plan:`)
    console.log(`   New tournaments to import: ${newTournaments.length}`)
    console.log(`   Skipping (already exist): ${skippedCount}\n`)

    if (dryRun) {
      console.log('🔍 Dry run - showing first 5 new tournaments:')
      console.log(JSON.stringify(newTournaments.slice(0, 5), null, 2))
      console.log('\n✅ Dry run complete!')
      return
    }

    if (newTournaments.length === 0) {
      console.log('✅ No new tournaments to import!')
      return
    }

    // Import tournaments in batches
    console.log('📥 Importing new tournaments...')
    let imported = 0
    let failed = 0
    const batchSize = 50

    for (let i = 0; i < newTournaments.length; i += batchSize) {
      const batch = newTournaments.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (tournament) => {
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
            console.error(`Failed to import "${tournament.name}":`, error)
            failed++
          }
        })
      )

      // Progress indicator
      const progress = Math.min(i + batchSize, newTournaments.length)
      console.log(`Progress: ${progress}/${newTournaments.length} (${((progress / newTournaments.length) * 100).toFixed(1)}%)`)
    }

    console.log('\n✅ Import complete!')
    console.log(`   Imported: ${imported}`)
    console.log(`   Failed: ${failed}`)
    console.log(`   Skipped (existing): ${skippedCount}`)
    console.log(`   Total processed: ${tournaments.length}`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

importTournaments()
