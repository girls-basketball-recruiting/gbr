import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * Sign out route - redirects to Clerk's sign-out endpoint
 */
export async function GET(req: Request) {
  const { userId } = await auth()

  // Build sign-out URL with redirect back to home
  const signOutUrl = new URL('/sign-in', req.url)
  signOutUrl.searchParams.set('redirect_url', '/')

  // If user is authenticated, redirect to Clerk's sign-out
  if (userId) {
    const clerkSignOutUrl = new URL('/sign-out', req.url)
    clerkSignOutUrl.searchParams.set('redirect_url', '/')
    return NextResponse.redirect(clerkSignOutUrl)
  }

  // Already signed out, redirect to home
  return NextResponse.redirect(new URL('/', req.url))
}

export async function POST(req: Request) {
  return GET(req)
}
