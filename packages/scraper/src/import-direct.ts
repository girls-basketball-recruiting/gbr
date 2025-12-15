import 'dotenv/config'
import { readFileSync } from 'fs'
import { sql } from '@vercel/postgres'

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
  if (div.includes('d1') || div.includes('d i') || div.includes('division i')) return 'd1'
  if (div.includes('d2') || div.includes('d ii') || div.includes('division ii')) return 'd2'
  if (div.includes('d3') || div.includes('d iii') || div.includes('division iii')) return 'd3'
  if (div.includes('naia')) return 'naia'
  if (div.includes('juco') || div.includes('njcaa') || div.includes('jc')) return 'juco'
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

    // Clear existing colleges
    console.log('🗑️  Clearing existing colleges...')
    const deleteResult = await sql`DELETE FROM colleges`
    console.log(`Deleted ${deleteResult.rowCount} existing colleges`)

    // Import colleges in batches
    console.log('📥 Importing colleges...')
    let imported = 0
    let failed = 0
    const batchSize = 100

    for (let i = 0; i < colleges.length; i += batchSize) {
      const batch = colleges.slice(i, i + batchSize)

      // Build VALUES clause for batch insert
      const values: string[] = []
      const params: any[] = []
      let paramIndex = 1

      for (const college of batch) {
        values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, NOW(), NOW())`)
        params.push(
          college.school,
          college.city,
          college.state,
          normalizeType(college.type),
          college.conference,
          normalizeDivision(college.division)
        )
        paramIndex += 6
      }

      try {
        const query = `
          INSERT INTO colleges (school, city, state, type, conference, division, created_at, updated_at)
          VALUES ${values.join(', ')}
        `

        await sql.query(query, params)
        imported += batch.length
      } catch (error) {
        console.error(`Failed to import batch starting at ${batch[0]?.school}:`, error)
        failed += batch.length
      }

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
