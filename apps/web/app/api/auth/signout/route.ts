import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  // Sign out the user
  await auth.protect()

  // Redirect to Clerk's sign-out endpoint with redirect to home
  return NextResponse.redirect(
    new URL('/sign-in', process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || 'http://localhost:3000')
  )
}
