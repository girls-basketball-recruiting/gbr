import 'dotenv/config'
import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'

async function debugScrape() {
  console.log('🚀 Starting debug scraper...')

  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()

    console.log('📄 Navigating to NCSA website...')
    await page.goto('https://www.ncsasports.org/womens-basketball/colleges', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    })

    console.log('⏳ Waiting for content to load...')
    await page.waitForSelector('.wp-block-ncsa-college-list', { timeout: 30000 })
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // Take a screenshot
    await page.screenshot({ path: 'debug-screenshot.png', fullPage: true })
    console.log('📸 Screenshot saved to debug-screenshot.png')

    // Get the HTML of the college list
    const html = await page.evaluate(() => {
      const container = document.querySelector('.wp-block-ncsa-college-list')
      return container ? container.innerHTML : 'Container not found'
    })

    writeFileSync('debug-html.html', html)
    console.log('💾 HTML saved to debug-html.html')

    // Try to find rows
    const rowCount = await page.evaluate(() => {
      const rows = document.querySelectorAll('.wp-block-ncsa-college-list .row')
      console.log('Found rows:', rows.length)

      // Get first few rows for inspection
      const samples = Array.from(rows).slice(0, 3).map((row) => {
        return {
          html: row.innerHTML,
          classes: row.className,
          childCount: row.children.length,
        }
      })

      return { count: rows.length, samples }
    })

    console.log('🔍 Row inspection:', JSON.stringify(rowCount, null, 2))

    console.log('\n⏸️  Browser will stay open for 30 seconds for manual inspection...')
    await new Promise((resolve) => setTimeout(resolve, 30000))
  } finally {
    await browser.close()
  }
}

debugScrape()
