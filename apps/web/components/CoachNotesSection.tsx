'use client'

import { useState, useEffect } from 'react'
import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
import { Label } from '@workspace/ui/components/label'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { DatePicker } from '@workspace/ui/components/date-picker'
import { format } from 'date-fns'

interface ContactRecord {
  date: string
  contactType: string
  summary: string
  followUpNeeded: boolean
  followUpDate?: string
}

interface CoachNotesData {
  notes: string
  contactRecords: ContactRecord[]
  interestLevel?: string
}

export function CoachNotesSection({
  playerId,
  coachId,
}: {
  playerId: string
  coachId: string
}) {
  const [notesData, setNotesData] = useState<CoachNotesData>({
    notes: '',
    contactRecords: [],
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newContact, setNewContact] = useState({
    date: new Date(),
    contactType: 'email',
    summary: '',
    followUpNeeded: false,
    followUpDate: undefined as Date | undefined,
  })

  // Fetch existing notes
  useEffect(() => {
    async function fetchNotes() {
      try {
        const response = await fetch(`/api/coach-notes/${coachId}/${playerId}`)
        if (response.ok) {
          const data = await response.json()
          setNotesData({
            notes: data.notes || '',
            contactRecords: data.contactRecords || [],
            interestLevel: data.interestLevel,
          })
        }
      } catch (err) {
        console.error('Error fetching notes:', err)
      }
    }
    fetchNotes()
  }, [coachId, playerId])

  const handleSaveNotes = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/coach-notes/${coachId}/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notesData),
      })

      if (!response.ok) {
        throw new Error('Failed to save notes')
      }

      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddContact = async () => {
    if (!newContact.summary) {
      setError('Please add a summary for this contact')
      return
    }

    // Format dates as ISO strings for the API
    const formattedContact = {
      date: format(newContact.date, 'yyyy-MM-dd'),
      contactType: newContact.contactType,
      summary: newContact.summary,
      followUpNeeded: newContact.followUpNeeded,
      followUpDate: newContact.followUpDate
        ? format(newContact.followUpDate, 'yyyy-MM-dd')
        : undefined,
    }

    const updatedContacts = [...notesData.contactRecords, formattedContact]
    const updatedData = { ...notesData, contactRecords: updatedContacts }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/coach-notes/${coachId}/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        throw new Error('Failed to add contact record')
      }

      setNotesData(updatedData)
      setIsAddingContact(false)
      setNewContact({
        date: new Date(),
        contactType: 'email',
        summary: '',
        followUpNeeded: false,
        followUpDate: undefined,
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add contact record',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='space-y-6'>
      {/* General Notes */}
      <Card className='bg-slate-800/50 border-slate-700 p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold text-white'>Your Notes</h2>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className='bg-blue-600 hover:bg-blue-700'
            >
              Edit Notes
            </Button>
          )}
        </div>

        {error && (
          <div className='bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4'>
            {error}
          </div>
        )}

        {isEditing ? (
          <div className='space-y-4'>
            <div>
              <Label htmlFor='notes' className='text-slate-200'>
                Notes
              </Label>
              <Textarea
                id='notes'
                value={notesData.notes}
                onChange={(e) =>
                  setNotesData({ ...notesData, notes: e.target.value })
                }
                rows={6}
                placeholder='Add your notes and observations about this player...'
                className='bg-slate-900 border-slate-600 text-white'
              />
            </div>

            <div>
              <Label htmlFor='interestLevel' className='text-slate-200'>
                Interest Level
              </Label>
              <Select
                value={notesData.interestLevel || ''}
                onValueChange={(value) =>
                  setNotesData({ ...notesData, interestLevel: value })
                }
              >
                <SelectTrigger className='bg-slate-900 border-slate-600 text-white'>
                  <SelectValue placeholder='Select interest level' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='high'>High Interest</SelectItem>
                  <SelectItem value='medium'>Medium Interest</SelectItem>
                  <SelectItem value='low'>Low Interest</SelectItem>
                  <SelectItem value='watching'>Watching</SelectItem>
                  <SelectItem value='not-interested'>Not Interested</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex gap-2'>
              <Button
                onClick={handleSaveNotes}
                disabled={isSaving}
                className='bg-green-600 hover:bg-green-700'
              >
                {isSaving ? 'Saving...' : 'Save Notes'}
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant='outline'
                className='border-slate-600 text-slate-300'
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className='text-slate-300 whitespace-pre-wrap'>
            {notesData.notes ||
              'No notes yet. Click "Edit Notes" to add notes.'}
            {notesData.interestLevel && (
              <div className='mt-4 pt-4 border-t border-slate-700'>
                <span className='text-slate-400'>Interest Level: </span>
                <span className='font-medium capitalize'>
                  {notesData.interestLevel.replace('-', ' ')}
                </span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Contact/Outreach Records */}
      <Card className='bg-slate-800/50 border-slate-700 p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold text-white'>Contact History</h2>
          {!isAddingContact && (
            <Button
              onClick={() => setIsAddingContact(true)}
              className='bg-orange-600 hover:bg-orange-700'
            >
              Add Contact
            </Button>
          )}
        </div>

        {/* Add Contact Form */}
        {isAddingContact && (
          <div className='bg-slate-900/50 p-4 rounded-lg mb-4 space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-slate-200'>Date</Label>
                <DatePicker
                  date={newContact.date}
                  onDateChange={(date) =>
                    setNewContact({ ...newContact, date: date || new Date() })
                  }
                  className='bg-slate-900 border-slate-600 text-white'
                />
              </div>
              <div>
                <Label htmlFor='contactType' className='text-slate-200'>
                  Type
                </Label>
                <Select
                  value={newContact.contactType}
                  onValueChange={(value) =>
                    setNewContact({ ...newContact, contactType: value })
                  }
                >
                  <SelectTrigger className='bg-slate-900 border-slate-600 text-white'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='email'>Email</SelectItem>
                    <SelectItem value='phone'>Phone Call</SelectItem>
                    <SelectItem value='text'>Text Message</SelectItem>
                    <SelectItem value='in-person'>In-Person Meeting</SelectItem>
                    <SelectItem value='video'>Video Call</SelectItem>
                    <SelectItem value='game-visit'>Game Visit</SelectItem>
                    <SelectItem value='campus-visit'>Campus Visit</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor='contactSummary' className='text-slate-200'>
                Summary
              </Label>
              <Textarea
                id='contactSummary'
                value={newContact.summary}
                onChange={(e) =>
                  setNewContact({ ...newContact, summary: e.target.value })
                }
                rows={3}
                placeholder='What was discussed or observed...'
                className='bg-slate-900 border-slate-600 text-white'
              />
            </div>

            <div className='flex gap-2'>
              <Button
                onClick={handleAddContact}
                disabled={isSaving}
                className='bg-green-600 hover:bg-green-700'
              >
                {isSaving ? 'Saving...' : 'Save Contact'}
              </Button>
              <Button
                onClick={() => setIsAddingContact(false)}
                variant='outline'
                className='border-slate-600 text-slate-300'
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Contact Records List */}
        <div className='space-y-4'>
          {notesData.contactRecords.length === 0 ? (
            <p className='text-slate-400 text-center py-8'>
              No contact records yet. Click "Add Contact" to log your first
              interaction.
            </p>
          ) : (
            notesData.contactRecords
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
              .map((contact, index) => (
                <div
                  key={index}
                  className='bg-slate-900/50 p-4 rounded-lg border border-slate-700'
                >
                  <div className='flex justify-between items-start mb-2'>
                    <div>
                      <span className='font-medium text-white capitalize'>
                        {contact.contactType.replace('-', ' ')}
                      </span>
                      <span className='text-slate-400 text-sm ml-2'>
                        {new Date(contact.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className='text-slate-300 whitespace-pre-wrap'>
                    {contact.summary}
                  </p>
                </div>
              ))
          )}
        </div>
      </Card>
    </div>
  )
}
