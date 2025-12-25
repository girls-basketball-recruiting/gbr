'use client'

import React from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

const InvitationUrlField: React.FC = () => {
  const { id } = useDocumentInfo()
  const token = useFormFields(([fields]) => fields.token?.value as string)
  const role = useFormFields(([fields]) => fields.role?.value as 'player' | 'coach')
  const [copied, setCopied] = React.useState(false)

  if (!token || !role) {
    return (
      <div style={{ padding: '12px', color: '#666', fontStyle: 'italic' }}>
        Invitation URL will be generated after saving
      </div>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const invitationUrl = `${baseUrl}/register-${role}?invite=${token}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
    }}>
      <div style={{
        fontSize: '13px',
        fontWeight: 500,
        color: '#374151',
        marginBottom: '8px',
      }}>
        Share this invitation link:
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      }}>
        <input
          type="text"
          value={invitationUrl}
          readOnly
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#1f2937',
          }}
        />
        <button
          type="button"
          onClick={handleCopy}
          style={{
            padding: '8px 16px',
            backgroundColor: copied ? '#10b981' : '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.2s',
          }}
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
      </div>

      <div style={{
        marginTop: '12px',
        fontSize: '12px',
        color: '#6b7280',
      }}>
        This link will register a {role} with first year free promotion
      </div>
    </div>
  )
}

export default InvitationUrlField
