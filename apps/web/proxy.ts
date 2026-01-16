import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Routes that require authentication (editing/managing, not viewing)
// Viewing routes like /players, /programs, /tournaments are all public
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',      // Your own profile (view/edit)
  '/prospects(.*)',    // Prospect management (coach only)
  '/subscription',     // Subscription management
])

// PayloadCMS operations panel routes - completely separate from frontend app
// These use PayloadCMS's own authentication system
const isPayloadAdminRoute = createRouteMatcher([
  '/ops(.*)', // PayloadCMS operations panel
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
  '/payment', // Payment page (Clerk auth required but not DB user check)
  '/', // Home page is public (shows public page if not authenticated, dashboard if authenticated)
])

// Routes that require active subscription when authenticated
// This check happens BEFORE onboarding check
const requiresSubscription = createRouteMatcher([
  '/',                // Home page requires subscription when authenticated
  '/onboarding/(.*)', // Must pay before onboarding
  '/profile(.*)',     // Must pay to access profile
  '/prospects(.*)',   // Must pay to access prospects
  '/subscription',    // Must pay to access subscription management
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

  // Get auth status for all routes (needed for subscription check on public routes)
  const { userId } = await auth()

  if (userId) {
    requestHeaders.set('x-clerk-id', userId)
  }

  // Subscription check: routes that require active subscription when authenticated
  // This check happens BEFORE onboarding check to ensure users pay first
  // Check runs even on public routes (e.g., "/" shows dashboard for authenticated users)
  if (userId && requiresSubscription(request)) {
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      const hasActiveSubscription = user.publicMetadata?.hasActiveSubscription

      if (!hasActiveSubscription) {
        return NextResponse.redirect(new URL('/payment', request.url))
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
      // On error, allow access and let page-level checks handle it
    }
  }

  // Allow public routes without further checks
  if (isPublicRoute(request)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // If accessing a protected route without auth, require login
  if (isProtectedRoute(request) && !userId) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

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