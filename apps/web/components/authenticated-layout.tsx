import { SidebarLayout } from './sidebar-layout'
import { currentUser } from '@clerk/nextjs/server'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const user = await currentUser()

  // For logged-out users on homepage, render without sidebar
  if (!user) {
    return <>{children}</>
  }

  // For authenticated users, render with sidebar
  return <SidebarLayout>{children}</SidebarLayout>
}
