'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { Trash2, AlertTriangle } from 'lucide-react'
import { useUser, useReverification } from '@clerk/nextjs'

interface DeleteAccountButtonProps {
  userRole: 'player' | 'coach'
}

export function DeleteAccountButton({ userRole }: DeleteAccountButtonProps) {
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Wrap the delete operation with reverification
  const performDelete = useReverification(async () => {
    await user?.delete()
    // Use full page reload instead of client-side navigation to ensure session is cleared
    window.location.href = '/'
  })

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      // Delete the user from Clerk with reverification
      await performDelete()
    } catch (err) {
      console.error('Error deleting account:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete account')
      setIsDeleting(false)
    }
  }

  const impactMessages = {
    player: [
      'Your player profile will be permanently deleted',
      'Coaches who saved you will no longer see your profile',
      'Your saved college programs will be removed',
      'All your data will be permanently deleted',
    ],
    coach: [
      'Your coach profile will be permanently deleted',
      'Your saved players list will be removed',
      'Your manually entered prospects will be deleted',
      'All notes on players will be permanently deleted',
      'All your data will be permanently deleted',
    ],
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='destructive' className='w-full sm:w-auto'>
          <Trash2 className='w-4 h-4 mr-2' />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-120'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-red-600'>
            <AlertTriangle className='w-5 h-5' />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              <strong>Warning: This action is permanent!</strong>
            </AlertDescription>
          </Alert>

          <div className='space-y-2'>
            <p className='text-sm font-medium text-slate-900 dark:text-white'>
              What will be deleted:
            </p>
            <ul className='list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400'>
              {impactMessages[userRole].map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirm'>
              Type <span className='font-mono font-bold'>DELETE</span> to confirm
            </Label>
            <Input
              id='confirm'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder='Type DELETE here'
              className='font-mono'
              disabled={isDeleting}
            />
          </div>

          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE' || isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
