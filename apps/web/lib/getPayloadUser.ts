import { headers } from 'next/headers'
import { getPayload } from 'payload'

import config from '@/payload.config'

export async function getPayloadUser(): Promise<{
  payloadUser: object
  payloadConfig: { routes: { admin: string } }
}> {
  const requestHeaders = await headers()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const user = await payload.auth({ headers: requestHeaders })

  console.log('Current PayloadCMS user:', user)
  return { payloadUser: user, payloadConfig }
}
