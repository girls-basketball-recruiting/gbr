import { getPayloadUser } from '@/lib/getPayloadUser'

export async function GET() {
  const user = await getPayloadUser()
  return Response.json(user)
}
