import { SidebarLayout } from './sidebar-layout'
import { currentUser } from '@clerk/nextjs/server'
import { headers } from 'next/headers'

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
  const isAuthRoute = pathname.startsWith('/sign-in') ||
                      pathname.startsWith('/sign-up') ||
                      pathname.startsWith('/register-')

  // For logged-out users or auth/onboarding routes, render without sidebar
  if (!user || isAuthRoute || isOnboardingRoute) {
    return <>{children}</>
  }

  // For authenticated users on regular routes, render with sidebar
  return <SidebarLayout>{children}</SidebarLayout>
}
