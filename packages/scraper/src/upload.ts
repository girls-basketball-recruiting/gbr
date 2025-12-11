import type { College } from './types.js'

export async function uploadToEdgeConfig(colleges: College[]): Promise<void> {
  const edgeConfigId = process.env.EDGE_CONFIG_ID
  const vercelToken = process.env.VERCEL_TOKEN

  if (!edgeConfigId || !vercelToken) {
    throw new Error(
      'Missing required environment variables: EDGE_CONFIG_ID and VERCEL_TOKEN'
    )
  }

  // Vercel Edge Config API endpoint
  const url = `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`

  try {
    // Edge Config accepts items as key-value pairs
    // We'll store the colleges array under a single key 'colleges'
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'upsert',
            key: 'colleges',
            value: colleges,
          },
          {
            operation: 'upsert',
            key: 'lastUpdated',
            value: new Date().toISOString(),
          },
          {
            operation: 'upsert',
            key: 'totalCount',
            value: colleges.length,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to upload to Edge Config: ${response.status} ${errorText}`)
    }

    console.log(`✅ Successfully uploaded ${colleges.length} colleges to Edge Config`)
    console.log(`📅 Last updated: ${new Date().toISOString()}`)
  } catch (error) {
    console.error('❌ Failed to upload to Edge Config:', error)
    throw error
  }
}
