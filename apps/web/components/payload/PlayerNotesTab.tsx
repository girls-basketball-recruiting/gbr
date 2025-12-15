'use client'

import React from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

const PlayerNotesTab: React.FC = () => {
  const { id } = useDocumentInfo()
  const [notes, setNotes] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchNotes() {
      try {
        const response = await fetch(
          `/api/coach-player-notes?where[coach][equals]=${id}&depth=1&limit=100`
        )
        const data = await response.json()
        setNotes(data.docs || [])
      } catch (error) {
        console.error('Error fetching notes:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchNotes()
    }
  }, [id])

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading notes...</div>
  }

  if (notes.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#666' }}>
        No player notes yet. Notes will appear here.
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
        Player Notes ({notes.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {notes.map((note) => {
          const player = typeof note.player === 'object' ? note.player : null
          return (
            <div
              key={note.id}
              style={{
                border: '1px solid #e5e5e5',
                padding: '16px',
                borderRadius: '6px',
                backgroundColor: '#fafafa',
              }}
            >
              <div style={{ fontWeight: 500, marginBottom: '8px' }}>
                {player?.firstName} {player?.lastName}
              </div>

              {note.interestLevel && (
                <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 500 }}>Interest:</span>{' '}
                  <span style={{
                    textTransform: 'capitalize',
                    color: note.interestLevel === 'high' ? '#059669' :
                           note.interestLevel === 'medium' ? '#d97706' : '#6b7280'
                  }}>
                    {note.interestLevel}
                  </span>
                </div>
              )}

              {note.notes && (
                <div style={{
                  fontSize: '14px',
                  color: '#374151',
                  marginBottom: '12px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {note.notes}
                </div>
              )}

              {note.contactRecords && note.contactRecords.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                    Contact History ({note.contactRecords.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {note.contactRecords.slice(0, 3).map((contact: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: '13px',
                          padding: '8px',
                          backgroundColor: '#fff',
                          border: '1px solid #e5e5e5',
                          borderRadius: '4px',
                        }}
                      >
                        <div style={{ color: '#6b7280' }}>
                          {new Date(contact.date).toLocaleDateString()} • {contact.contactType}
                        </div>
                        <div style={{ marginTop: '4px', color: '#374151' }}>
                          {contact.summary}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {note.tags && note.tags.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {note.tags.map((t: any, idx: number) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        backgroundColor: '#e0e7ff',
                        color: '#3730a3',
                        borderRadius: '4px',
                      }}
                    >
                      {t.tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PlayerNotesTab
