'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Field, FieldLabel, FieldDescription } from '@workspace/ui/components/field'
import { FileUpload } from '@/components/ui/FileUpload'
import Image from 'next/image'

interface ProfileImageUploadProps {
  label?: string
  description?: string
  initialImageUrl?: string | null
  onImageChange?: (file: File | null) => void
  userType?: 'player' | 'coach'
}

/**
 * Reusable profile image upload component for both players and coaches.
 * Handles file selection, preview, and removal with consistent UI/UX.
 */
export function ProfileImageUpload({
  label = 'Profile Photo',
  description = 'Upload a profile photo (JPG, PNG, or GIF)',
  initialImageUrl,
  onImageChange,
  userType = 'player',
}: ProfileImageUploadProps) {
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null | undefined>(
    initialImageUrl ?? undefined
  )

  const handleImageSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0]
      if (!file) return

      setProfileImageFile(file)
      onImageChange?.(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setProfileImageFile(null)
    setProfileImagePreview(null)
    onImageChange?.(null)
  }

  return (
    <Field className='gap-1'>
      <FieldLabel htmlFor='profileImageUrl'>{label}</FieldLabel>
      <div className='space-y-4'>
        {profileImagePreview && (
          <div className='flex items-center gap-4'>
            <div className='w-20 h-20 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 relative shrink-0'>
              <Image
                src={profileImagePreview}
                alt={`${userType} photo preview`}
                fill
                className='object-cover'
              />
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleRemoveImage}
            >
              Remove Photo
            </Button>
          </div>
        )}
        {!profileImagePreview && (
          <FileUpload
            maxFiles={1}
            accept='image/*'
            onFilesChange={handleImageSelect}
            value={profileImageFile ? [profileImageFile] : undefined}
          />
        )}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  )
}

/**
 * Hook to manage profile image state for forms.
 * Returns the file and a component to render.
 */
export function useProfileImageUpload(
  initialImageUrl?: string | null,
  userType: 'player' | 'coach' = 'player'
) {
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)

  const ProfileImageField = () => (
    <ProfileImageUpload
      initialImageUrl={initialImageUrl}
      onImageChange={setProfileImageFile}
      userType={userType}
    />
  )

  return {
    profileImageFile,
    ProfileImageField,
  }
}
