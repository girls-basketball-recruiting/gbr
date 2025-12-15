'use client'

import { useEffect, useState } from 'react'
import { TournamentCard } from '@/components/ui/TournamentCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { useUser } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'

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
      <div className='p-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='w-8 h-8 text-slate-400 animate-spin' />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-white mb-2'>Tournaments</h1>
          <p className='text-slate-400'>
            {isPlayer
              ? "View upcoming tournaments and mark which ones you'll be attending"
              : 'View upcoming tournaments and see which players are attending'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className='mb-6 flex gap-2 border-b border-slate-700'>
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeFilter === 'upcoming'
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveFilter('past')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeFilter === 'past'
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeFilter === 'all'
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            All
          </button>
        </div>

        {/* Results count */}
        <div className='mb-6'>
          <p className='text-slate-400'>
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
                onToggleAttendance={
                  isPlayer ? handleToggleAttendance : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
