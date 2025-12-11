import 'dotenv/config'
import { readFileSync } from 'fs'
import { JSDOM } from 'jsdom'
import { uploadToEdgeConfigCLI } from './upload-cli.js'
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

    // Skip the first row if it's a header
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

        // Only add if school name exists
        if (college.school) {
          colleges.push(college)
        }
      }
    }

    console.log(`✅ Parsed ${colleges.length} colleges`)

    if (colleges.length === 0) {
      console.warn('⚠️ No colleges found. Check the HTML structure.')
      throw new Error('No data parsed')
    }

    return colleges
  } catch (error) {
    console.error('❌ Error parsing HTML:', error)
    throw error
  }
}

async function main() {
  try {
    const colleges = await parseHTML()

    // Display sample data
    console.log('\n📊 Sample data (first 5 colleges):')
    console.log(JSON.stringify(colleges.slice(0, 5), null, 2))

    // Display last 5 to verify we got the full list
    console.log('\n📊 Last 5 colleges:')
    console.log(JSON.stringify(colleges.slice(-5), null, 2))

    // Upload to Vercel Edge Config using CLI
    console.log('\n☁️ Uploading to Vercel Edge Config via CLI...')
    await uploadToEdgeConfigCLI(colleges)

    console.log('\n🎉 Parsing and upload complete!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
