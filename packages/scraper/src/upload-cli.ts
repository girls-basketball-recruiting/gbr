import 'dotenv/config'
import { writeFileSync, unlinkSync } from 'fs'
import { execSync } from 'child_process'
import type { College } from './types.js'

export async function uploadToEdgeConfigCLI(colleges: College[]): Promise<void> {
  const edgeConfigId = process.env.EDGE_CONFIG_ID

  if (!edgeConfigId) {
    throw new Error('Missing required environment variable: EDGE_CONFIG_ID')
  }

  try {
    // Write data to temporary JSON files
    const collegesFile = 'temp-colleges.json'
    const metadataFile = 'temp-metadata.json'

    console.log(`📝 Writing data to temporary files...`)
    writeFileSync(collegesFile, JSON.stringify(colleges))
    writeFileSync(
      metadataFile,
      JSON.stringify({
        lastUpdated: new Date().toISOString(),
        totalCount: colleges.length,
      })
    )

    // Use Vercel CLI to update Edge Config
    console.log('📤 Uploading colleges data via Vercel CLI...')
    console.log('   This may take a moment due to the large dataset...')

    try {
      // Update colleges using file input to avoid command line length limits
      execSync(
        `vercel edge-config set colleges "$(cat ${collegesFile})" --edge-config-id ${edgeConfigId}`,
        { stdio: 'pipe', encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
      )

      console.log('✅ Colleges data uploaded')

      // Update metadata
      console.log('📤 Uploading metadata...')
      execSync(
        `vercel edge-config set lastUpdated '"${new Date().toISOString()}"' --edge-config-id ${edgeConfigId}`,
        { stdio: 'pipe' }
      )

      execSync(
        `vercel edge-config set totalCount ${colleges.length} --edge-config-id ${edgeConfigId}`,
        { stdio: 'pipe' }
      )

      console.log(`✅ Successfully uploaded ${colleges.length} colleges to Edge Config`)
      console.log(`📅 Last updated: ${new Date().toISOString()}`)
    } finally {
      // Clean up temp files
      try {
        unlinkSync(collegesFile)
        unlinkSync(metadataFile)
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  } catch (error: any) {
    console.error('❌ Failed to upload via CLI:', error.message)
    console.log('\n💡 Troubleshooting:')
    console.log('   1. Check if Vercel CLI is installed: vercel --version')
    console.log('   2. Check if logged in: vercel whoami')
    console.log('   3. Verify Edge Config ID is correct')
    console.log('   4. Try using the API token method instead (see README)')
    throw error
  }
}
