import { getPayload } from 'payload'
import config from '@/payload.config'
import { PlayerFilters } from '@/components/PlayerFilters'
import { SavePlayerButton } from '@/components/SavePlayerButton'
import { SortByDropdown } from '@/components/SortByDropdown'
import { Pagination } from '@/components/Pagination'
import { currentUser } from '@clerk/nextjs/server'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlayerCard } from '@/components/ui/PlayerCard'
import { PublicNav } from '@/components/PublicNav'
import { UnauthenticatedCTA } from '@/components/UnauthenticatedCTA'
import { PlayersPageContent } from '@/components/PlayersPageContent'

interface PlayersPageProps {
  searchParams: Promise<{
    graduationYear?: string
    position?: string
    minGpa?: string
    maxGpa?: string
    minHeight?: string
    maxHeight?: string
    state?: string
    city?: string
    sortBy?: string
    page?: string
    view?: 'grid' | 'table'
  }>
}

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const params = await searchParams

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Check if user is a coach
  const clerkUser = await currentUser()
  const isCoach = clerkUser?.publicMetadata?.role === 'coach'
  let savedPlayerIds: number[] = []

  if (isCoach && clerkUser) {
    // Find the PayloadCMS user and coach profile
    const users = await payload.find({
      collection: 'users',
      where: {
        clerkId: {
          equals: clerkUser.id,
        },
      },
    })

    if (users.docs.length > 0) {
      const payloadUser = users.docs[0]!

      const coaches = await payload.find({
        collection: 'coaches',
        where: {
          user: {
            equals: payloadUser.id,
          },
        },
      })

      if (coaches.docs.length > 0) {
        const coachProfile = coaches.docs[0]!

        // Get saved player IDs
        const savedPlayers = await payload.find({
          collection: 'saved-players',
          where: {
            coach: {
              equals: coachProfile.id,
            },
          },
        })

        savedPlayerIds = savedPlayers.docs.map((sp: any) =>
          typeof sp.player === 'object' ? sp.player.id : sp.player,
        )
      }
    }
  }

  // Build dynamic where clause based on filters
  const where: any = {
    // Exclude soft-deleted players by default
    deletedAt: {
      exists: false,
    },
  }

  if (params.graduationYear) {
    where.graduationYear = { equals: parseInt(params.graduationYear) }
  }

  if (params.position) {
    where.primaryPosition = { equals: params.position }
  }

  if (params.minGpa || params.maxGpa) {
    where.weightedGpa = {}
    if (params.minGpa) {
      where.weightedGpa.greater_than_equal = parseFloat(params.minGpa)
    }
    if (params.maxGpa) {
      where.weightedGpa.less_than_equal = parseFloat(params.maxGpa)
    }
  }

  if (params.minHeight || params.maxHeight) {
    where.heightInInches = {}
    if (params.minHeight) {
      where.heightInInches.greater_than_equal = parseInt(params.minHeight)
    }
    if (params.maxHeight) {
      where.heightInInches.less_than_equal = parseInt(params.maxHeight)
    }
  }

  if (params.state) {
    where.state = { contains: params.state, options: 'i' }
  }

  if (params.city) {
    where.city = { contains: params.city, options: 'i' }
  }

  // Determine sort order
  let sort = '-createdAt' // default: newest first
  if (params.sortBy === 'graduation-asc') {
    sort = 'graduationYear'
  } else if (params.sortBy === 'graduation-desc') {
    sort = '-graduationYear'
  } else if (params.sortBy === 'gpa-desc') {
    sort = '-weightedGpa'
  } else if (params.sortBy === 'gpa-asc') {
    sort = 'weightedGpa'
  } else if (params.sortBy === 'oldest') {
    sort = 'createdAt'
  }

  // Pagination
  const page = parseInt(params.page || '1')
  const limit = 24
  const offset = (page - 1) * limit

  // Fetch players with filters
  const playersData = await payload.find({
    collection: 'players',
    where: Object.keys(where).length > 0 ? where : undefined,
    limit,
    page,
    sort,
  })

  const players = playersData.docs
  const totalPages = playersData.totalPages
  const totalDocs = playersData.totalDocs

  const isLoggedOut = !clerkUser

  return (
    <>
      {isLoggedOut && <PublicNav activePage='players' />}
      <div className='min-h-screen bg-slate-50 dark:bg-slate-900'>
        <div className={isLoggedOut ? 'py-12 px-4' : 'p-8'}>
          <div className='max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-8'>
              <h1 className='text-4xl font-bold mb-2 text-slate-900 dark:text-white'>
                Browse Players
              </h1>
              <p className='text-slate-600 dark:text-slate-400'>
                Find talented recruits and save them to your board
              </p>
            </div>

            {/* Unauthenticated CTA */}
            {isLoggedOut && (
              <div className='mb-8'>
                <UnauthenticatedCTA
                  title='Create an Account to Connect'
                  description='Sign up as a coach to save players, take notes, and build your recruiting board. Sign up as a player to create your profile and get discovered.'
                  variant='premium'
                />
              </div>
            )}

            {/* Filters */}
            <PlayerFilters />

            {/* Content */}
            <PlayersPageContent
              players={players}
              totalDocs={totalDocs}
              totalPages={totalPages}
              currentPage={page}
              savedPlayerIds={savedPlayerIds}
              isCoach={isCoach}
              initialView={(params.view as 'grid' | 'table') || 'grid'}
            />
          </div>
        </div>
      </div>
    </>
  )
}
