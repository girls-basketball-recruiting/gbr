'use client'

import React from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

const SavedProgramsTab: React.FC = () => {
  const { id } = useDocumentInfo()
  const [savedPrograms, setSavedPrograms] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchSavedPrograms() {
      try {
        const response = await fetch(
          `/api/player-saved-programs?where[player][equals]=${id}&depth=1&limit=100`
        )
        const data = await response.json()
        setSavedPrograms(data.docs || [])
      } catch (error) {
        console.error('Error fetching saved programs:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSavedPrograms()
    }
  }, [id])

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading saved programs...</div>
  }

  if (savedPrograms.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#666' }}>
        No saved programs yet. Saved programs will appear here.
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
        Saved Programs ({savedPrograms.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {savedPrograms.map((saved) => {
          const college = typeof saved.college === 'object' ? saved.college : null
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
                {college?.name}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {college?.city && college?.state && `${college.city}, ${college.state}`}
                {college?.conference && ` • ${college.conference}`}
              </div>
              {saved.notes && (
                <div style={{ fontSize: '14px', color: '#333', marginTop: '8px', fontStyle: 'italic' }}>
                  {saved.notes}
                </div>
              )}
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

export default SavedProgramsTab
