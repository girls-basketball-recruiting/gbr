'use client'

import React from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { getPositionLabel } from '@/types/positions'

const SavedPlayersTab: React.FC = () => {
  const { id } = useDocumentInfo()
  const [savedPlayers, setSavedPlayers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchSavedPlayers() {
      try {
        const response = await fetch(
          `/api/saved-players?where[coach][equals]=${id}&depth=1&limit=100`
        )
        const data = await response.json()
        setSavedPlayers(data.docs || [])
      } catch (error) {
        console.error('Error fetching saved players:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSavedPlayers()
    }
  }, [id])

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading saved players...</div>
  }

  if (savedPlayers.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#666' }}>
        No saved players yet. Saved players will appear here.
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
        Saved Players ({savedPlayers.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {savedPlayers.map((saved) => {
          const player = typeof saved.player === 'object' ? saved.player : null
          return (
            <div
              key={saved.id}
              style={{
                border: '1px solid #e5e5e5',
                padding: '16px',
                borderRadius: '6px',
                backgroundColor: '#fafafa',
              }}
            >
              <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                {player?.firstName} {player?.lastName}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {player?.primaryPosition && getPositionLabel(player.primaryPosition)}
                {player?.graduationYear && ` • Class of ${player.graduationYear}`}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                Saved: {new Date(saved.savedAt).toLocaleDateString()}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SavedPlayersTab
