import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/register-player(.*)',
  '/register-coach(.*)',
  '/onboarding/player(.*)',
  '/onboarding/coach(.*)',
  '/players/(.*)', // Public player profiles for SEO
  '/api/webhooks(.*)', // Webhooks should be public but verified
  '/admin(.*)', // PayloadCMS handles its own authentication
])

export default clerkMiddleware(async (auth, request) => {
  // Allow public routes (including /admin since PayloadCMS handles auth)
  if (isPublicRoute(request)) {
    return
  }

  // Protect all other routes - require Clerk authentication
  await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
