'use client'

import { useEffect, useState } from 'react'
import { TournamentCard } from '@/components/ui/TournamentCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { useUser } from '@clerk/nextjs'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { PublicNav } from '@/components/PublicNav'
import { UnauthenticatedCTA } from '@/components/UnauthenticatedCTA'

interface Tournament {
  id: number
  name: string
  location: string
  startDate: string
  endDate: string
  description?: string | null
  website?: string | null
  attendeeCount: number
}

type FilterTab = 'all' | 'upcoming' | 'past'

export default function TournamentsPage() {
  const { user } = useUser()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [attendingIds, setAttendingIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('upcoming')

  const isPlayer = user?.publicMetadata?.role === 'player'
  const isAuthenticated = !!user
  const isLoggedOut = !user

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch tournaments
      const tournamentsRes = await fetch('/api/tournaments')
      const tournamentsData = await tournamentsRes.json()

      setTournaments(tournamentsData.tournaments || [])

      // If player, fetch their attending tournaments
      if (isPlayer) {
        const profileRes = await fetch('/api/profile/player')
        const profileData = await profileRes.json()

        if (profileData.player?.tournamentSchedule) {
          const ids = profileData.player.tournamentSchedule.map((t: any) =>
            typeof t === 'object' ? t.id : t,
          )
          setAttendingIds(ids)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
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
      setTournaments(tournamentsData.tournaments || [])
    } catch (error) {
      console.error('Error toggling attendance:', error)
    }
  }

  const isUpcoming = (endDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    return end >= today
  }

  const filteredTournaments = tournaments.filter((tournament) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'upcoming') return isUpcoming(tournament.endDate)
    if (activeFilter === 'past') return !isUpcoming(tournament.endDate)
    return true
  })

  const sortedTournaments = [...filteredTournaments].sort((a, b) => {
    const dateA = new Date(a.startDate).getTime()
    const dateB = new Date(b.startDate).getTime()
    return dateA - dateB
  })

  if (isLoading) {
    return (
      <>
        {isLoggedOut && <PublicNav activePage='tournaments' />}
        <div className='min-h-screen bg-slate-50 dark:bg-slate-900'>
          <div className={isLoggedOut ? 'py-12 px-4' : 'p-8'}>
            <div className='max-w-7xl mx-auto'>
              <LoadingSpinner size='lg' text='Loading tournaments...' />
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {isLoggedOut && <PublicNav activePage='tournaments' />}
      <div className='min-h-screen bg-slate-50 dark:bg-slate-900'>
        <div className={isLoggedOut ? 'py-12 px-4' : 'p-8'}>
          <div className='max-w-7xl mx-auto'>
            {/* Header */}
            <div className='mb-8'>
              <h1 className='text-4xl font-bold mb-2 text-slate-900 dark:text-white'>
                Tournaments
              </h1>
              <p className='text-slate-600 dark:text-slate-400'>
                {isPlayer
                  ? "View upcoming tournaments and mark which ones you'll be attending"
                  : 'View upcoming tournaments and see which players are attending'}
              </p>
            </div>

            {/* Unauthenticated CTA */}
            {isLoggedOut && (
              <div className='mb-8'>
                <UnauthenticatedCTA
                  title='Join to Track Your Schedule'
                  description="Sign up as a player to mark tournaments you're attending and get discovered by college coaches. Coaches can see which events have the most talent."
                  variant='premium'
                />
              </div>
            )}

            {/* Filter Tabs */}
            <div className='mb-6 flex gap-2 border-b border-slate-300 dark:border-slate-700'>
              <button
                onClick={() => setActiveFilter('upcoming')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  activeFilter === 'upcoming'
                    ? 'text-orange-600 dark:text-orange-500 border-orange-600 dark:border-orange-500'
                    : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveFilter('past')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  activeFilter === 'past'
                    ? 'text-orange-600 dark:text-orange-500 border-orange-600 dark:border-orange-500'
                    : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                Past
              </button>
              <button
                onClick={() => setActiveFilter('all')}
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
                {sortedTournaments.length}{' '}
                {sortedTournaments.length === 1 ? 'tournament' : 'tournaments'}
              </p>
            </div>

            {/* Tournaments Grid */}
            {sortedTournaments.length === 0 ? (
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
                {sortedTournaments.map((tournament) => (
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
          </div>
        </div>
      </div>
    </>
  )
}
