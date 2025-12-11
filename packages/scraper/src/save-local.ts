import 'dotenv/config'
import { readFileSync, writeFileSync } from 'fs'
import { JSDOM } from 'jsdom'
import type { College } from './types.js'

async function parseHTML(): Promise<College[]> {
  console.log('🚀 Starting HTML parser...')

  try {
    console.log('📄 Reading debug-html.html...')
    const html = readFileSync('debug-html.html', 'utf-8')

    console.log('🔍 Parsing HTML...')
    const dom = new JSDOM(html)
    const document = dom.window.document

    const rows = document.querySelectorAll('.row')
    const colleges: College[] = []

    console.log(`Found ${rows.length} rows`)

    const dataRows = Array.from(rows).filter((row) => {
      return !row.classList.contains('headers')
    })

    for (const row of dataRows) {
      const columns = row.querySelectorAll('.container > div')

      if (columns.length >= 5) {
        const college = {
          school: columns[0]?.textContent?.trim() || '',
          city: columns[1]?.textContent?.split(',')[0]?.trim() || '',
          state: columns[1]?.textContent?.split(',')[1]?.trim() || '',
          type: columns[2]?.textContent?.trim() || '',
          conference: columns[3]?.textContent?.trim() || '',
          division: columns[4]?.textContent?.trim() || '',
        }

        if (college.school) {
          colleges.push(college)
        }
      }
    }

    console.log(`✅ Parsed ${colleges.length} colleges`)
    return colleges
  } catch (error) {
    console.error('❌ Error parsing HTML:', error)
    throw error
  }
}

async function main() {
  try {
    const colleges = await parseHTML()

    console.log('\n📊 Sample data (first 5 colleges):')
    console.log(JSON.stringify(colleges.slice(0, 5), null, 2))

    console.log('\n📊 Last 5 colleges:')
    console.log(JSON.stringify(colleges.slice(-5), null, 2))

    // Calculate data size
    const dataString = JSON.stringify(colleges)
    const sizeInBytes = Buffer.byteLength(dataString)
    const sizeInKB = (sizeInBytes / 1024).toFixed(2)
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2)

    console.log(`\n📏 Data size: ${sizeInKB} KB (${sizeInMB} MB)`)
    console.log(`📊 Total colleges: ${colleges.length}`)

    // Save to file
    const outputFile = 'colleges-data.json'
    const output = {
      colleges,
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalCount: colleges.length,
        sizeKB: sizeInKB,
      },
    }

    writeFileSync(outputFile, JSON.stringify(output, null, 2))
    console.log(`\n💾 Saved to ${outputFile}`)

    // Check if too large for Edge Config (512KB limit per item)
    if (sizeInBytes > 512 * 1024) {
      console.log('\n⚠️  WARNING: Data exceeds Edge Config 512KB limit!')
      console.log('   Consider storing this in:')
      console.log('   1. Vercel Blob Storage (unlimited size)')
      console.log('   2. Database (Postgres, etc.)')
      console.log('   3. Or split into chunks')
    } else {
      console.log('\n✅ Data size is within Edge Config limits')
    }

    console.log('\n🎉 Parsing complete!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
