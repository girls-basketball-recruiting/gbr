'use client'

import {
  FileUpload as FileUploadPrimitive,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
} from '@workspace/ui/components/file-upload'
import {
  CloudUpload,
  Trash2,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  accept?: string
  value?: File[]
}

export function FileUpload({
  onFilesChange,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = 'image/png, image/jpeg, image/jpg, image/webp', // Default to basic images
  value,
}: FileUploadProps) {
  return (
    <FileUploadPrimitive
      maxFiles={maxFiles}
      maxSize={maxSize}
      accept={accept}
      onValueChange={onFilesChange}
      value={value}
    >
      <FileUploadDropzone className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <div className="flex flex-col items-center gap-2 text-center text-slate-500 dark:text-slate-400">
          <CloudUpload className="w-8 h-8" />
          <p className="text-sm">
            Drag & drop files here, or click to select
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Supports: JPG, PNG, WEBP (Max {maxSize / 1024 / 1024}MB)
          </p>
        </div>
      </FileUploadDropzone>
      
      <FileUploadList>
        {value && value.map((file, index) => (
          <FileUploadItem key={index} value={file} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <FileUploadItemPreview className="border-slate-200 dark:border-slate-800" />
            <FileUploadItemMetadata className="text-slate-700 dark:text-slate-300" />
            <FileUploadItemProgress />
            <FileUploadItemDelete asChild>
              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </Button>
            </FileUploadItemDelete>
          </FileUploadItem>
        ))}
      </FileUploadList>
    </FileUploadPrimitive>
  )
}
