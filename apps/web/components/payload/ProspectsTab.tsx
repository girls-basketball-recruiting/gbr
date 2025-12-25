'use client'

import React from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { formatHeight } from '@/lib/formatters'

const ProspectsTab: React.FC = () => {
  const { id } = useDocumentInfo()
  const [prospects, setProspects] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchProspects() {
      try {
        const response = await fetch(
          `/api/prospects?where[coach][equals]=${id}&depth=1&limit=100`
        )
        const data = await response.json()
        setProspects(data.docs || [])
      } catch (error) {
        console.error('Error fetching prospects:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProspects()
    }
  }, [id])

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading prospects...</div>
  }

  if (prospects.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#666' }}>
        No prospects yet. Prospects you add will appear here.
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
        Prospects ({prospects.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {prospects.map((prospect) => (
          <div
            key={prospect.id}
            style={{
              border: '1px solid #e5e5e5',
              padding: '16px',
              borderRadius: '6px',
              backgroundColor: '#fafafa',
            }}
          >
            <div style={{ fontWeight: 500, marginBottom: '4px' }}>
              {prospect.name}
              {prospect.uniformNumber && (
                <span style={{ marginLeft: '8px', color: '#6b7280' }}>
                  #{prospect.uniformNumber}
                </span>
              )}
            </div>

            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
              Class of {prospect.graduationYear}
              {prospect.heightInInches && ` • ${formatHeight(prospect.heightInInches)}`}
              {prospect.weight && ` • ${prospect.weight} lbs`}
            </div>

            {prospect.highSchool && (
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                {prospect.highSchool}
              </div>
            )}

            {prospect.aauProgram && (
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                AAU: {prospect.aauProgram}
              </div>
            )}

            {prospect.tournamentSchedule && prospect.tournamentSchedule.length > 0 && (
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                Tournaments: {prospect.tournamentSchedule.length}
              </div>
            )}

            {prospect.notes && (
              <div
                style={{
                  fontSize: '13px',
                  marginTop: '8px',
                  padding: '8px',
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {prospect.notes}
              </div>
            )}

            {prospect.linkedPlayer && (
              <div
                style={{
                  fontSize: '12px',
                  marginTop: '8px',
                  color: '#059669',
                  fontWeight: 500,
                }}
              >
                ✓ Linked to registered player
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProspectsTab
