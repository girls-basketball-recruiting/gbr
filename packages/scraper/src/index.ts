import 'dotenv/config'
import puppeteer from 'puppeteer'
import { uploadToEdgeConfig } from './upload.js'
import type { College } from './types.js'

async function scrapeColleges(): Promise<College[]> {
  console.log('🚀 Starting college scraper...')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()

    console.log('📄 Navigating to NCSA website...')
    await page.goto('https://www.ncsasports.org/womens-basketball/colleges', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    })

    console.log('⏳ Waiting for table to load...')
    // Wait for the college list container to appear
    await page.waitForSelector('.wp-block-ncsa-college-list', { timeout: 30000 })

    // Give it extra time for dynamic content to fully load
    await page.waitForSelector('.row', { timeout: 30000 })
    await new Promise((resolve) => setTimeout(resolve, 3000))

    console.log('🔍 Extracting college data...')
    const colleges = await page.evaluate(() => {
      const rows = document.querySelectorAll('.wp-block-ncsa-college-list .row')
      const data: College[] = []

      // Skip the first row if it's a header
      const dataRows = Array.from(rows).filter((row) => {
        return !row.classList.contains('headers')
      })

      for (const row of dataRows) {
        const columns = row.querySelectorAll('.container > div')

        if (columns.length >= 6) {
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
            data.push(college)
          }
        }
      }

      return data
    })

    console.log(`✅ Scraped ${colleges.length} colleges`)

    if (colleges.length === 0) {
      console.warn('⚠️ No colleges found. The page structure may have changed.')
      throw new Error('No data scraped')
    }

    return colleges
  } finally {
    await browser.close()
  }
}

async function main() {
  try {
    const colleges = await scrapeColleges()

    // Display sample data
    console.log('\n📊 Sample data (first 5 colleges):')
    console.log(JSON.stringify(colleges.slice(0, 5), null, 2))

    // Upload to Vercel Edge Config
    console.log('\n☁️ Uploading to Vercel Edge Config...')
    await uploadToEdgeConfig(colleges)

    console.log('\n🎉 Scraping complete!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
