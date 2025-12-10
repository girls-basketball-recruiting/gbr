import { currentUser } from '@clerk/nextjs/server'
import PublicHomePage from '@/components/PublicHomePage'
import DashboardPage from '@/components/DashboardPage'

export default async function Page() {
  const user = await currentUser()

  if (!user) {
    return <PublicHomePage />
  }

  return <DashboardPage />
}
