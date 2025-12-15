import { currentUser } from '@clerk/nextjs/server'
import { SidebarLayout } from './sidebar-layout'
import { getPayload } from 'payload'
import config from '@/payload.config'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const clerkUser = await currentUser()

  // If no user, render children without sidebar (for login/register pages)
  if (!clerkUser) {
    return <>{children}</>
  }

  // Get role from PayloadCMS user
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const users = await payload.find({
    collection: 'users',
    where: {
      clerkId: {
        equals: clerkUser.id,
      },
    },
  })

  const payloadUser = users.docs[0]
  const role = payloadUser?.roles?.[0]

  const user = {
    name:
      clerkUser.firstName ||
      clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] ||
      'User',
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    role: role,
  }

  return <SidebarLayout user={user}>{children}</SidebarLayout>
}
