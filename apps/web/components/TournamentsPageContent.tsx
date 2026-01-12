'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TournamentCalendarCard } from '@/components/ui/TournamentCalendarCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Tournament } from '@/payload-types'

type FilterTab = 'all' | 'upcoming' | 'past'

const isUpcoming = (endDate: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  return end >= today
}

const filterTournaments = <T extends { endDate: string }>(
  tournaments: T[],
  filter: FilterTab
): T[] => {
  if (filter === 'all') return tournaments
  if (filter === 'upcoming') return tournaments.filter((t) => isUpcoming(t.endDate))
  if (filter === 'past') return tournaments.filter((t) => !isUpcoming(t.endDate))
  return tournaments
}

interface TournamentsPageContentProps {
  tournaments: (Tournament & { attendeeCount?: number })[]
  attendingIds: number[]
  isPlayer: boolean
  isAuthenticated: boolean
}

export function TournamentsPageContent({
  tournaments,
  attendingIds: initialAttendingIds,
  isPlayer,
  isAuthenticated,
}: TournamentsPageContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeFilter = (searchParams.get('filter') as FilterTab) || 'upcoming'

  const [attendingIds, setAttendingIds] = useState(initialAttendingIds)
  const [localTournaments, setLocalTournaments] = useState(tournaments)

  // Sync local tournaments when server-side filtered tournaments change
  useEffect(() => {
    setLocalTournaments(tournaments)
  }, [tournaments])

  const handleFilterChange = (filter: FilterTab) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('filter', filter)
    router.push(`/tournaments?${params.toString()}`)
  }

  const handleToggleAttendance = async (tournamentId: number) => {
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/toggle-attendance`,
        {
          method: 'POST',
        },
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

      // Refresh tournaments to update attendee counts, keeping the current filter
      const tournamentsRes = await fetch('/api/tournaments/list')
      const tournamentsData = await tournamentsRes.json()
      const allTournaments = tournamentsData.tournaments || []
      setLocalTournaments(filterTournaments(allTournaments, activeFilter))
    } catch (error) {
      console.error('Error toggling attendance:', error)
    }
  }

  return (
    <>
      {/* Filter Tabs */}
      <div className='mb-6 flex gap-2 border-b'>
        <button
          onClick={() => handleFilterChange('upcoming')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeFilter === 'upcoming'
              ? 'border-current'
              : 'border-transparent'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => handleFilterChange('past')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeFilter === 'past'
              ? 'border-current'
              : 'border-transparent'
          }`}
        >
          Past
        </button>
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeFilter === 'all'
              ? 'border-current'
              : 'border-transparent'
          }`}
        >
          All
        </button>
      </div>

      {/* Results count */}
      <div className='mb-6'>
        <p>
          {localTournaments.length}{' '}
          {localTournaments.length === 1 ? 'tournament' : 'tournaments'}
        </p>
      </div>

      {/* Tournaments Grid */}
      {localTournaments.length === 0 ? (
        <EmptyState
          title='No Tournaments Found'
          description={
            activeFilter === 'upcoming'
              ? 'There are no upcoming tournaments at this time.'
              : activeFilter === 'past'
                ? 'No past tournaments to display.'
                : 'No tournaments available.'
          }
        />
      ) : (
        <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-6'>
          {localTournaments.map((tournament) => (
            <TournamentCalendarCard
              key={tournament.id}
              tournament={tournament}
              isAttending={attendingIds.includes(tournament.id)}
              isPlayer={isPlayer}
              isAuthenticated={isAuthenticated}
              onToggleAttendance={
                isPlayer ? handleToggleAttendance : undefined
              }
            />
          ))}
        </div>
      )}
    </>
  )
}
