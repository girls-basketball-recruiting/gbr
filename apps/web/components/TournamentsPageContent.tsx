'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ListPageToolbar } from './ListPageToolbar'
import { TournamentSortDropdown } from './TournamentSortDropdown'
import { TournamentCalendarCard } from '@/components/ui/TournamentCalendarCard'
import { TournamentsTable } from './TournamentsTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { URLPagination } from './URLPagination'
import { useViewPreference } from '@/hooks/useViewPreference'
import { Calendar, Users, ChevronRight, Zap } from 'lucide-react'
import { formatDateLocationRange } from '@/lib/format-date-location'
import type { Tournament } from '@/payload-types'

interface TournamentsPageContentProps {
  tournaments: (Tournament & { attendeeCount?: number })[]
  inProgressTournaments: (Tournament & { attendeeCount?: number })[]
  totalDocs: number
  totalPages: number
  currentPage: number
  attendingIds: number[]
  isPlayer: boolean
  isAuthenticated: boolean
}

export function TournamentsPageContent({
  tournaments,
  inProgressTournaments,
  totalDocs,
  totalPages,
  currentPage,
  attendingIds: initialAttendingIds,
  isPlayer,
  isAuthenticated,
}: TournamentsPageContentProps) {
  const router = useRouter()
  const { view, handleViewChange } = useViewPreference('tournaments', 'grid')

  const [attendingIds, setAttendingIds] = useState(initialAttendingIds)
  const [localTournaments, setLocalTournaments] = useState(tournaments)
  const [localInProgress, setLocalInProgress] = useState(inProgressTournaments)

  // Sync local state when server data changes
  useEffect(() => {
    setLocalTournaments(tournaments)
  }, [tournaments])

  useEffect(() => {
    setLocalInProgress(inProgressTournaments)
  }, [inProgressTournaments])

  const handleToggleAttendance = async (tournamentId: number) => {
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/toggle-attendance`,
        {
          method: 'POST',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to toggle attendance')
      }

      const data = await response.json()

      // Update local state
      if (data.isAttending) {
        setAttendingIds([...attendingIds, tournamentId])
      } else {
        setAttendingIds(attendingIds.filter((id) => id !== tournamentId))
      }

      // Refresh the page to get updated data
      router.refresh()
    } catch (error) {
      console.error('Error toggling attendance:', error)
    }
  }

  return (
    <>
      {/* Happening Now - Hero Section */}
      {localInProgress.length > 0 && (
        <div className='mb-10'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-green-500 to-emerald-600 shadow-lg'>
              <Zap className='w-5 h-5 text-white' />
            </div>
            <h2 className='text-2xl font-bold tracking-tight'>Happening Now</h2>
            <span className='relative flex h-3 w-3'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-3 w-3 bg-green-500'></span>
            </span>
          </div>

          <div className='space-y-3'>
            {localInProgress.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.id}`}
                className='group block'
              >
                <div className='relative overflow-hidden rounded-2xl bg-linear-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 dark:from-green-500/20 dark:via-emerald-500/20 dark:to-teal-500/20 border border-green-200 dark:border-green-800 p-5 transition-all hover:border-green-300 dark:hover:border-green-700'>
                  {/* Animated background accent */}
                  <div className='absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-green-400/20 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2' />

                  <div className='relative flex items-center justify-between gap-4'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-3 mb-2'>
                        <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-sm'>
                          <span className='relative flex h-2 w-2'>
                            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75'></span>
                            <span className='relative inline-flex rounded-full h-2 w-2 bg-white'></span>
                          </span>
                          Live
                        </span>
                        <h3 className='text-xl font-bold truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors'>
                          {tournament.name}
                        </h3>
                      </div>

                      <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
                        <div className='flex items-center gap-1.5'>
                          <Calendar className='w-4 h-4 text-green-600 dark:text-green-400' />
                          <span>
                            {formatDateLocationRange(
                              tournament.startDate.toString(),
                              tournament.endDate.toString(),
                              tournament.city,
                              tournament.state
                            )}
                          </span>
                        </div>
                        {isAuthenticated && (
                          <div className='flex items-center gap-1.5'>
                            <Users className='w-4 h-4 text-green-600 dark:text-green-400' />
                            <span className='font-medium'>
                              {tournament.attendeeCount ?? 0} players attending
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='shrink-0'>
                      <div className='w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors'>
                        <ChevronRight className='w-5 h-5 text-green-600 dark:text-green-400' />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <ListPageToolbar
        totalCount={totalDocs}
        itemLabel='tournament'
        view={view}
        onViewChange={handleViewChange}
        sortSelector={isAuthenticated ? <TournamentSortDropdown /> : undefined}
      />

      {/* Content */}
      {localTournaments.length === 0 ? (
        <EmptyState
          title='No Tournaments Found'
          description='No tournaments match your current filters. Try adjusting your search criteria.'
        />
      ) : view === 'table' ? (
        <TournamentsTable
          tournaments={localTournaments}
          attendingIds={attendingIds}
          isAuthenticated={isAuthenticated}
        />
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {localTournaments.map((tournament) => (
            <TournamentCalendarCard
              key={tournament.id}
              tournament={tournament}
              isAttending={attendingIds.includes(tournament.id)}
              isPlayer={isPlayer}
              isAuthenticated={isAuthenticated}
              onToggleAttendance={isPlayer ? handleToggleAttendance : undefined}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='mt-8'>
          <URLPagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </>
  )
}
