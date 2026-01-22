import { ProspectsPageContent } from '@/components/ProspectsPageContent'
import { getPayloadClient } from '@/lib/payload-helpers'
import type { CoachProspect } from '@/payload-types'

interface ProspectsListProps {
  coachId: number
  searchParams: {
    sortBy?: string
    page?: string
  }
}

export async function ProspectsList({ coachId, searchParams }: ProspectsListProps) {
  const payload = await getPayloadClient()

  // Determine sort order
  let sort: string
  switch (searchParams.sortBy) {
    case 'newest':
      sort = '-createdAt'
      break
    case 'oldest':
      sort = 'createdAt'
      break
    case 'name-asc':
      sort = 'lastName'
      break
    case 'graduation-asc':
      sort = 'graduationYear'
      break
    case 'graduation-desc':
      sort = '-graduationYear'
      break
    case 'updated':
    default:
      sort = '-updatedAt'
      break
  }

  // Pagination
  const page = parseInt(searchParams.page || '1')
  const limit = 24

  // Fetch prospects using Payload API
  const result = await payload.find({
    collection: 'coach-prospects',
    where: {
      coach: { equals: coachId },
    },
    sort,
    limit,
    page,
  })

  return (
    <ProspectsPageContent
      prospects={result.docs as CoachProspect[]}
      totalDocs={result.totalDocs}
      totalPages={result.totalPages}
      currentPage={page}
    />
  )
}
