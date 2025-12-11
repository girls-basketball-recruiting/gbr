import { getPayload } from 'payload'
import config from '@/payload.config'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'
import { PlayerFilters } from '@/components/PlayerFilters'
import { SavePlayerButton } from '@/components/SavePlayerButton'
import { ActiveFilterChips } from '@/components/ActiveFilterChips'
import { SortByDropdown } from '@/components/SortByDropdown'
import { Pagination } from '@/components/Pagination'
import { currentUser } from '@clerk/nextjs/server'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlayerCard } from '@/components/ui/PlayerCard'

interface PlayersPageProps {
  searchParams: Promise<{
    graduationYear?: string
    position?: string
    minGpa?: string
    maxGpa?: string
    minHeight?: string
    state?: string
    city?: string
    sortBy?: string
    page?: string
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

  if (params.minHeight) {
    where.height = { contains: params.minHeight }
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

  return (
    <div className='min-h-svh bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12'>
      <div className='container mx-auto px-4'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <Link href='/'>
              <Button
                variant='outline'
                className='border-slate-600 text-white hover:bg-slate-800 mb-4'
              >
                ← Back to Dashboard
              </Button>
            </Link>
            <h1 className='text-4xl font-bold text-white mb-2'>
              Browse Players
            </h1>
            <p className='text-slate-400'>
              Find talented recruits and save them to your board
            </p>
          </div>

          <div className='grid lg:grid-cols-4 gap-8'>
            {/* Filters Sidebar */}
            <div className='lg:col-span-1'>
              <PlayerFilters />
            </div>

            {/* Players Grid */}
            <div className='lg:col-span-3'>
              {/* Active Filters and Sort */}
              <div className='mb-6 space-y-4'>
                {/* Active filter chips */}
                <ActiveFilterChips />

                {/* Results count and sort */}
                <div className='flex items-center justify-between'>
                  <p className='text-slate-400'>
                    {totalDocs} {totalDocs === 1 ? 'player' : 'players'} found
                  </p>
                  <SortByDropdown />
                </div>
              </div>

              {/* Players grid */}
              {players.length === 0 ? (
                <EmptyState
                  title='No Players Found'
                  description='No players match your current filters. Try adjusting your search criteria.'
                />
              ) : (
                <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-6'>
                  {players.map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      action={
                        isCoach ? (
                          <SavePlayerButton
                            playerId={player.id}
                            initialIsSaved={savedPlayerIds.includes(player.id)}
                            variant='outline'
                            className='border-slate-600 text-white hover:bg-slate-800'
                          />
                        ) : undefined
                      }
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              <Pagination currentPage={page} totalPages={totalPages} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
