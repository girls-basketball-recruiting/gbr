'use client'

import React from 'react'

interface ScrapeResult {
  success: boolean
  timestamp: string
  stats: {
    totalFetched: number
    existingCount: number
    newTournaments: number
    imported: number
    failed: number
    skipped: number
  }
}

const TournamentScraperActions: React.FC = () => {
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<ScrapeResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleScrape = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/admin/scrape-tournaments', {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape tournaments')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        padding: '16px 24px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <button
        onClick={handleScrape}
        disabled={loading}
        style={{
          padding: '8px 16px',
          backgroundColor: loading ? '#9ca3af' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 500,
          fontSize: '14px',
        }}
      >
        {loading ? 'Scraping...' : 'Import from ACA Hoops'}
      </button>

      {loading && (
        <span style={{ color: '#666', fontSize: '14px' }}>
          Fetching tournaments from all regions. This may take a moment...
        </span>
      )}

      {error && (
        <span style={{ color: '#dc2626', fontSize: '14px' }}>Error: {error}</span>
      )}

      {result && (
        <span style={{ color: '#16a34a', fontSize: '14px' }}>
          Imported {result.stats.imported} new tournaments
          {result.stats.skipped > 0 && ` (${result.stats.skipped} already existed)`}
          {result.stats.failed > 0 && ` (${result.stats.failed} failed)`}
        </span>
      )}
    </div>
  )
}

export default TournamentScraperActions
