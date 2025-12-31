'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Field, FieldLabel, FieldDescription, FieldError } from '@workspace/ui/components/field'
import {
  FileUpload as FileUploadPrimitive,
  FileUploadDropzone,
} from '@workspace/ui/components/file-upload'
import { Upload, X, Check, CloudUpload } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@workspace/ui/lib/utils'

interface ProfileImageUploadProps {
  label?: string
  description?: string
  required?: boolean
  initialImageUrl?: string | null
  onImageChange?: (file: File | null) => void
  userType?: 'player' | 'coach'
  error?: string
}

type ImageState = 'empty' | 'selected' | 'saved' | 'error'

/**
 * Refined profile image upload component with clear visual states.
 * Shows: empty, file selected (pending save), saved, and error states.
 */
export function ProfileImageUpload({
  label = 'Profile Photo',
  description,
  required = false,
  initialImageUrl,
  onImageChange,
  userType = 'player',
  error,
}: ProfileImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl ?? null)

  // Determine current state
  const getState = (): ImageState => {
    if (error) return 'error'
    if (selectedFile) return 'selected' // File selected but not yet saved
    if (initialImageUrl) return 'saved' // Has saved image
    return 'empty'
  }

  const state = getState()

  const handleFilesChange = (files?: File[]) => {
    const file = files?.[0]
    if (!file) return

    setSelectedFile(file)
    onImageChange?.(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    onImageChange?.(null)
  }

  return (
    <Field className="gap-2">
      <FieldLabel>
        {label}
        {required && <span className="ml-1 text-red-600 dark:text-red-400" aria-label="required">*</span>}
      </FieldLabel>

      <FileUploadPrimitive
        maxFiles={1}
        maxSize={5 * 1024 * 1024}
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onValueChange={handleFilesChange}
        value={selectedFile ? [selectedFile] : undefined}
      >
        {!previewUrl ? (
          /* Drop Zone - shown when empty */
          <FileUploadDropzone
            className={cn(
              'w-full min-h-50 rounded-lg transition-all',
              'bg-slate-50 dark:bg-slate-900',
              'border-2 border-dashed',
              state === 'error'
                ? 'border-red-500 dark:border-red-400'
                : 'border-slate-300 dark:border-slate-700',
              'hover:bg-slate-100 dark:hover:bg-slate-800',
              'hover:border-slate-400 dark:hover:border-slate-600',
              'data-[dragging=true]:border-blue-500 dark:data-[dragging=true]:border-blue-400',
              'data-[dragging=true]:bg-blue-50 dark:data-[dragging=true]:bg-blue-900/10'
            )}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  'bg-slate-100 dark:bg-slate-800',
                  'border-2 border-dashed',
                  state === 'error'
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-slate-300 dark:border-slate-600'
                )}
              >
                <CloudUpload className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Drag & drop your photo here
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  or click to browse
                </p>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                JPG, PNG, WEBP or GIF (max 5MB)
              </p>
            </div>
          </FileUploadDropzone>
        ) : (
          /* Preview - shown when image is selected or saved */
          <div className="flex items-start gap-4">
            {/* Preview Circle with Hover Edit UI */}
            <div className="relative shrink-0 group">
              <FileUploadDropzone asChild>
                <div
                  className={cn(
                    'relative w-24 h-24 rounded-full overflow-hidden transition-all cursor-pointer',
                    state === 'selected' && 'bg-slate-100 dark:bg-slate-800 border-2 border-blue-500 dark:border-blue-400',
                    state === 'saved' && 'bg-slate-100 dark:bg-slate-800',
                    state === 'error' && 'bg-slate-100 dark:bg-slate-800 border-2 border-red-500 dark:border-red-400'
                  )}
                >
                  <Image
                    src={previewUrl}
                    alt={`${userType} photo`}
                    fill
                    className="object-cover"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center">
                      <Upload className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-xs font-medium">Change</p>
                    </div>
                  </div>
                </div>
              </FileUploadDropzone>

              {/* State Indicator Badge */}
              {state === 'selected' && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  <Upload className="w-3 h-3 text-white" />
                </div>
              )}
              {state === 'saved' && initialImageUrl && !selectedFile && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 dark:bg-green-400 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Info and Controls */}
            <div className="flex-1 flex flex-col gap-2">
              {/* State Messages */}
              {state === 'selected' && (
                <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Photo will be saved when you submit the form
                </p>
              )}
              {state === 'saved' && !selectedFile && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Current photo
                </p>
              )}

              {/* Remove Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 w-fit"
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        )}
      </FileUploadPrimitive>

      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
