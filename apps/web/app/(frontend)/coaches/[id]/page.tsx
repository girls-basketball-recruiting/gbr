import { redirect } from 'next/navigation'
import { findById } from '@/lib/payload-helpers'

/**
 * Legacy route handler for old coach profile URLs.
 * Redirects /coaches/[id] to the new nested route /programs/[collegeId]/coaches/[id]
 * for backwards compatibility with existing bookmarks and external links.
 */
export default async function OldCoachRouteRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Fetch coach to get their collegeId
  const coach = await findById('coaches', id)

  if (!coach) {
    console.warn(`Coach redirect failed: coach ${id} not found`)
    redirect('/programs')
  }

  // Redirect to new nested route
  redirect(`/programs/${coach.collegeId}/coaches/${id}`)
}
