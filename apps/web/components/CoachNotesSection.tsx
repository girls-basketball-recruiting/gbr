'use client'

import { useState, useEffect } from 'react'
import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@workspace/ui/components/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { DatePicker } from '@workspace/ui/components/date-picker'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { AlertCircle } from 'lucide-react'
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
    <div className='space-y-6 max-w-2xl'>
      {/* General Notes */}
      <Card className='p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Your Notes</h2>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant='secondary'
              size='sm'
            >
              Edit Notes
            </Button>
          )}
        </div>

        {error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isEditing ? (
          <FieldGroup>
            <Field className='gap-1'>
              <FieldLabel htmlFor='notes'>Notes</FieldLabel>
              <Textarea
                id='notes'
                value={notesData.notes}
                onChange={(e) =>
                  setNotesData({ ...notesData, notes: e.target.value })
                }
                rows={6}
                placeholder='Add your notes and observations about this player...'
              />
            </Field>

            <Field className='gap-1'>
              <FieldLabel htmlFor='interestLevel'>Interest Level</FieldLabel>
              <Select
                value={notesData.interestLevel || ''}
                onValueChange={(value) =>
                  setNotesData({ ...notesData, interestLevel: value })
                }
              >
                <SelectTrigger>
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
            </Field>

            <div className='flex gap-2 pt-2'>
              <Button
                onClick={handleSaveNotes}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Notes'}
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant='outline'
              >
                Cancel
              </Button>
            </div>
          </FieldGroup>
        ) : (
          <div className='text-muted-foreground whitespace-pre-wrap'>
            {notesData.notes ||
              'No notes yet. Click "Edit Notes" to add notes.'}
            {notesData.interestLevel && (
              <div className='mt-4 pt-4 border-t'>
                <span className='text-muted-foreground'>Interest Level: </span>
                <span className='font-medium text-foreground capitalize'>
                  {notesData.interestLevel.replace('-', ' ')}
                </span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Contact/Outreach Records */}
      <Card className='p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Contact History</h2>
          {!isAddingContact && (
            <Button
              onClick={() => setIsAddingContact(true)}
              variant='secondary'
              size='sm'
            >
              Add Contact
            </Button>
          )}
        </div>

        {/* Add Contact Form */}
        {isAddingContact && (
          <div className='bg-muted/50 p-4 rounded-lg mb-4'>
            <FieldGroup>
              <div className='grid grid-cols-2 gap-4'>
                <Field className='gap-1'>
                  <FieldLabel>Date</FieldLabel>
                  <DatePicker
                    date={newContact.date}
                    onDateChange={(date) =>
                      setNewContact({ ...newContact, date: date || new Date() })
                    }
                  />
                </Field>
                <Field className='gap-1'>
                  <FieldLabel htmlFor='contactType'>Type</FieldLabel>
                  <Select
                    value={newContact.contactType}
                    onValueChange={(value) =>
                      setNewContact({ ...newContact, contactType: value })
                    }
                  >
                    <SelectTrigger>
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
                </Field>
              </div>

              <Field className='gap-1'>
                <FieldLabel htmlFor='contactSummary'>
                  Summary
                  <span className='ml-1 text-destructive' aria-label='required'>*</span>
                </FieldLabel>
                <Textarea
                  id='contactSummary'
                  value={newContact.summary}
                  onChange={(e) =>
                    setNewContact({ ...newContact, summary: e.target.value })
                  }
                  rows={3}
                  placeholder='What was discussed or observed...'
                />
                {error && error.includes('summary') && (
                  <FieldError>{error}</FieldError>
                )}
              </Field>

              <div className='flex gap-2'>
                <Button
                  onClick={handleAddContact}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Contact'}
                </Button>
                <Button
                  onClick={() => {
                    setIsAddingContact(false)
                    setError(null)
                  }}
                  variant='outline'
                >
                  Cancel
                </Button>
              </div>
            </FieldGroup>
          </div>
        )}

        {/* Contact Records List */}
        <div className='space-y-3'>
          {notesData.contactRecords.length === 0 ? (
            <p className='text-muted-foreground text-center py-8'>
              No contact records yet. Click &quot;Add Contact&quot; to log your first
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
                  className='bg-muted/50 p-4 rounded-lg border'
                >
                  <div className='flex justify-between items-start mb-2'>
                    <div>
                      <span className='font-medium capitalize'>
                        {contact.contactType.replace('-', ' ')}
                      </span>
                      <span className='text-muted-foreground text-sm ml-2'>
                        {new Date(contact.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className='text-muted-foreground whitespace-pre-wrap'>
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
