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
  '/api/graphql(.*)', // PayloadCMS GraphQL API
])

// PayloadCMS has its own auth - exclude ALL its API routes from Clerk
const isPayloadRoute = createRouteMatcher([
  '/api/users(.*)', // PayloadCMS users collection (auth, me, login, logout, etc.)
  '/api/admin(.*)', // PayloadCMS admin API
  '/api/payload-preferences(.*)', // PayloadCMS user preferences
  '/api/media(.*)', // PayloadCMS media collection
  '/api/players(.*)', // PayloadCMS players collection API
  '/api/coaches(.*)', // PayloadCMS coaches collection API
  '/api/colleges(.*)', // PayloadCMS colleges collection API
  '/api/tournaments(.*)', // PayloadCMS tournaments collection API
  '/api/prospects(.*)', // PayloadCMS prospects collection API
  '/api/saved-players(.*)', // PayloadCMS saved-players collection API
  '/api/coach-player-notes(.*)', // PayloadCMS coach-player-notes collection API
])

export default clerkMiddleware(async (auth, request) => {
  // Allow public routes (including /admin since PayloadCMS handles auth)
  if (isPublicRoute(request)) {
    return
  }

  // Allow all PayloadCMS API routes (PayloadCMS handles its own auth)
  if (isPayloadRoute(request)) {
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
