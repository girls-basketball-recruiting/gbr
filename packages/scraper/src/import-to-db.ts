import 'dotenv/config'
import { readFileSync } from 'fs'
import { getPayload } from 'payload'
import config from '../../../apps/web/payload.config.js'

interface College {
  school: string
  city: string
  state: string
  type: string
  conference: string
  division: string
}

// Map scraped division names to database values
function normalizeDivision(division: string): string {
  const div = division.toLowerCase().trim()
  if (div.includes('d i') || div.includes('division i')) return 'd1'
  if (div.includes('d ii') || div.includes('division ii')) return 'd2'
  if (div.includes('d iii') || div.includes('division iii')) return 'd3'
  if (div.includes('naia')) return 'naia'
  if (div.includes('juco') || div.includes('njcaa')) return 'juco'
  return 'other'
}

// Map scraped type to database values
function normalizeType(type: string): 'public' | 'private' {
  return type.toLowerCase().includes('public') ? 'public' : 'private'
}

async function importColleges() {
  console.log('🚀 Starting college import...')

  try {
    // Read the parsed data
    console.log('📄 Reading colleges-data.json...')
    const data = JSON.parse(readFileSync('colleges-data.json', 'utf-8'))
    const colleges: College[] = data.colleges

    console.log(`Found ${colleges.length} colleges to import`)

    // Get PayloadCMS instance
    console.log('🔌 Connecting to database...')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Clear existing colleges (optional - remove if you want to keep existing)
    console.log('🗑️  Clearing existing colleges...')
    const existing = await payload.find({
      collection: 'colleges',
      limit: 1000,
      pagination: false,
    })

    for (const college of existing.docs) {
      await payload.delete({
        collection: 'colleges',
        id: college.id,
      })
    }

    console.log(`Deleted ${existing.docs.length} existing colleges`)

    // Import colleges in batches
    console.log('📥 Importing colleges...')
    let imported = 0
    let failed = 0
    const batchSize = 50

    for (let i = 0; i < colleges.length; i += batchSize) {
      const batch = colleges.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (college) => {
          try {
            await payload.create({
              collection: 'colleges',
              data: {
                school: college.school,
                city: college.city,
                state: college.state,
                type: normalizeType(college.type),
                conference: college.conference,
                division: normalizeDivision(college.division),
              },
            })
            imported++
          } catch (error) {
            console.error(`Failed to import ${college.school}:`, error)
            failed++
          }
        })
      )

      // Progress indicator
      const progress = Math.min(i + batchSize, colleges.length)
      console.log(`Progress: ${progress}/${colleges.length} (${((progress / colleges.length) * 100).toFixed(1)}%)`)
    }

    console.log('\n✅ Import complete!')
    console.log(`   Imported: ${imported}`)
    console.log(`   Failed: ${failed}`)
    console.log(`   Total: ${colleges.length}`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

importColleges()
