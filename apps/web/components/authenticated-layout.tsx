import { SidebarLayout } from './sidebar-layout'
import { currentUser } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const user = await currentUser()
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Routes that should not show sidebar/header
  const isOnboardingRoute = pathname.startsWith('/onboarding/')
  const isPaymentRoute = pathname === '/payment'
  const isAuthRoute = pathname.startsWith('/sign-in') ||
                      pathname.startsWith('/sign-up') ||
                      pathname.startsWith('/register-')

  // For logged-out users or auth/onboarding/payment routes, render without sidebar
  if (!user || isAuthRoute || isOnboardingRoute || isPaymentRoute) {
    return <>{children}</>
  }

  // Check if user has completed onboarding before rendering sidebar
  // This prevents hooks errors from SidebarLayout rendering then redirecting
  const role = user.publicMetadata?.role as 'player' | 'coach' | undefined
  if (role) {
    const payload = await getPayload({ config })

    // Find user in DB first
    const dbUsers = await payload.find({
      collection: 'users',
      where: { clerkId: { equals: user.id } },
      limit: 1,
    })

    if (dbUsers.docs[0]) {
      if (role === 'player') {
        const playerProfiles = await payload.find({
          collection: 'players',
          where: { user: { equals: dbUsers.docs[0].id } },
          limit: 1,
        })

        if (!playerProfiles.docs[0]) {
          redirect('/onboarding/player')
        }
      } else if (role === 'coach') {
        const coachProfiles = await payload.find({
          collection: 'coaches',
          where: { user: { equals: dbUsers.docs[0].id } },
          limit: 1,
        })

        if (!coachProfiles.docs[0]) {
          redirect('/onboarding/coach')
        }
      }
    }
  }

  // For authenticated users on regular routes, render with sidebar
  return <SidebarLayout>{children}</SidebarLayout>
}
