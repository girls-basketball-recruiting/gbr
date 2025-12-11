import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Sign out the user
  await auth.protect()

  // Get the origin from the request or use the server URL
  const origin = new URL(request.url).origin || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  // Redirect to Clerk's sign-in page
  return NextResponse.redirect(new URL('/sign-in', origin))
}
