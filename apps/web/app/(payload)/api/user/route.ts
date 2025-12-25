import { getAuthContext } from '@/lib/auth-context'

export async function GET() {
  const { dbUser } = await getAuthContext()
  return Response.json(dbUser)
}
