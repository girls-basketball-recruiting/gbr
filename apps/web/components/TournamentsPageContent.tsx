'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TournamentCard } from '@/components/ui/TournamentCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Tournament } from '@/payload-types'

type FilterTab = 'all' | 'upcoming' | 'past'

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

      // Refresh tournaments to update attendee counts
      const tournamentsRes = await fetch('/api/tournaments')
      const tournamentsData = await tournamentsRes.json()
      setLocalTournaments(tournamentsData.tournaments || [])
    } catch (error) {
      console.error('Error toggling attendance:', error)
    }
  }

  return (
    <>
      {/* Filter Tabs */}
      <div className='mb-6 flex gap-2 border-b border-slate-300 dark:border-slate-700'>
        <button
          onClick={() => handleFilterChange('upcoming')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeFilter === 'upcoming'
              ? 'text-orange-600 dark:text-orange-500 border-orange-600 dark:border-orange-500'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => handleFilterChange('past')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeFilter === 'past'
              ? 'text-orange-600 dark:text-orange-500 border-orange-600 dark:border-orange-500'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          Past
        </button>
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeFilter === 'all'
              ? 'text-orange-600 dark:text-orange-500 border-orange-600 dark:border-orange-500'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          All
        </button>
      </div>

      {/* Results count */}
      <div className='mb-6'>
        <p className='text-slate-600 dark:text-slate-400'>
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
            <TournamentCard
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
