import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Routes that require authentication (editing/managing, not viewing)
// Viewing routes like /players, /programs, /tournaments are all public
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',      // Your own profile (view/edit)
  '/prospects(.*)',    // Prospect management (coach only)
])

// PayloadCMS admin routes - completely separate from frontend app
// These use PayloadCMS's own authentication system
const isPayloadAdminRoute = createRouteMatcher([
  '/admin(.*)', // PayloadCMS admin UI
])

// Public routes that don't require Clerk authentication
// These have their own verification mechanisms (webhook signatures, etc.)
const isPublicRoute = createRouteMatcher([
  '/api/webhooks/clerk(.*)', // Clerk webhooks (verified by Svix signature)
  '/api/webhooks/stripe(.*)', // Stripe webhooks (verified by Stripe signature)
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/register-player(.*)',
  '/register-coach(.*)',
  '/', // Home page is public
])

export default clerkMiddleware(async (auth, request) => {
  // Add pathname to request headers so layout can access it
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  // Allow PayloadCMS admin routes (PayloadCMS handles its own auth)
  if (isPayloadAdminRoute(request)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Allow public routes without authentication
  if (isPublicRoute(request)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // All other routes require Clerk authentication
  const { userId } = await auth()

  if (userId) {
    requestHeaders.set('x-clerk-id', userId)
  }

  // If accessing a protected route without auth, require login
  if (isProtectedRoute(request) && !userId) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Onboarding check should be handled in Layout or Page components
  // to allow using Payload Local API which requires Node environment.

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}