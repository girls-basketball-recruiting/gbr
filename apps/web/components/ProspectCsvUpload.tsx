'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@workspace/ui/components/dialog'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import {
  FileUpload as FileUploadPrimitive,
  FileUploadDropzone,
} from '@workspace/ui/components/file-upload'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Loader2,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import {
  generateSampleCsv,
  CSV_HEADER_LABELS,
  type CsvImportResult,
} from '@/lib/zod/ProspectsCsv'

type UploadState = 'idle' | 'selected' | 'uploading' | 'success' | 'error'

interface ProspectCsvUploadProps {
  onSuccess?: () => void
}

export function ProspectCsvUpload({ onSuccess }: ProspectCsvUploadProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<UploadState>('idle')
  const [result, setResult] = useState<CsvImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFilesChange = useCallback((files?: File[]) => {
    const selectedFile = files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setState('selected')
      setError(null)
      setResult(null)
    }
  }, [])

  const handleFileReject = useCallback((_: File, message: string) => {
    setError(message)
    setState('error')
  }, [])

  const validateFileClientSide = (file: File): string | null => {
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return 'Please upload a CSV file'
    }

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      return 'File size must be less than 1MB'
    }

    return null
  }

  const handleUpload = async () => {
    if (!file) return

    // Client-side validation
    const validationError = validateFileClientSide(file)
    if (validationError) {
      setError(validationError)
      setState('error')
      return
    }

    setState('uploading')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/prospects/import-csv', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data: CsvImportResult = await response.json()
        setResult(data)
        setState('success')
        onSuccess?.()
        router.refresh()
      } else {
        // Try to parse error response
        const text = await response.text()
        try {
          const errorData = JSON.parse(text)
          if (errorData.error) {
            try {
              // The error might be a stringified CsvImportResult
              const importResult: CsvImportResult = JSON.parse(errorData.error)
              setResult(importResult)
              setState('error')
            } catch {
              setError(errorData.error)
              setState('error')
            }
          } else {
            setError('Upload failed. Please try again.')
            setState('error')
          }
        } catch {
          setError('Upload failed. Please try again.')
          setState('error')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.')
      setState('error')
    }
  }

  const handleDownloadSample = () => {
    const csvContent = generateSampleCsv()
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'prospects_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setFile(null)
    setState('idle')
    setResult(null)
    setError(null)
  }

  const handleClose = () => {
    setIsOpen(false)
    // Reset after animation completes
    setTimeout(handleReset, 300)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <Upload className='w-4 h-4 mr-2' />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Import Prospects from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with prospect information. Download the template
            to see the expected format.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Download Template Button */}
          <Button
            variant='outline'
            size='sm'
            onClick={handleDownloadSample}
            className='w-full'
          >
            <Download className='w-4 h-4 mr-2' />
            Download CSV Template
          </Button>

          {/* Required Fields Info */}
          <div className='text-sm text-slate-500 dark:text-slate-400'>
            <p className='font-medium mb-1'>Required columns:</p>
            <ul className='list-disc list-inside space-y-0.5 text-xs'>
              <li>{CSV_HEADER_LABELS.firstName}</li>
              <li>{CSV_HEADER_LABELS.lastName}</li>
              <li>{CSV_HEADER_LABELS.graduationYear}</li>
            </ul>
          </div>

          {/* File Upload Zone */}
          {state === 'idle' || state === 'selected' || state === 'error' ? (
            <FileUploadPrimitive
              maxFiles={1}
              maxSize={1024 * 1024}
              accept='.csv,text/csv,application/vnd.ms-excel'
              onValueChange={handleFilesChange}
              onFileReject={handleFileReject}
              value={file ? [file] : undefined}
            >
              <FileUploadDropzone
                className={cn(
                  'min-h-32 rounded-lg transition-all cursor-pointer',
                  'bg-slate-50 dark:bg-slate-900',
                  'border-2 border-dashed',
                  state === 'error'
                    ? 'border-red-500 dark:border-red-400'
                    : state === 'selected'
                    ? 'border-green-500 dark:border-green-400'
                    : 'border-slate-300 dark:border-slate-700',
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  'hover:border-slate-400 dark:hover:border-slate-600'
                )}
              >
                <div className='flex flex-col items-center gap-2 text-center'>
                  {file ? (
                    <>
                      <FileSpreadsheet className='w-10 h-10 text-green-600 dark:text-green-400' />
                      <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                        {file.name}
                      </p>
                      <p className='text-xs text-slate-500'>
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className='w-10 h-10 text-slate-400' />
                      <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                        Drop your CSV file here
                      </p>
                      <p className='text-xs text-slate-500'>or click to browse</p>
                    </>
                  )}
                </div>
              </FileUploadDropzone>
            </FileUploadPrimitive>
          ) : state === 'uploading' ? (
            <div className='flex flex-col items-center justify-center py-8 gap-3'>
              <Loader2 className='w-10 h-10 animate-spin text-blue-600' />
              <p className='text-sm text-slate-600 dark:text-slate-400'>
                Importing prospects...
              </p>
            </div>
          ) : null}

          {/* Error Display */}
          {error && !result && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Result Display */}
          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle2 className='h-4 w-4 text-green-600' />
              ) : (
                <XCircle className='h-4 w-4' />
              )}
              <AlertTitle>
                {result.success
                  ? 'Import Successful'
                  : 'Import Completed with Errors'}
              </AlertTitle>
              <AlertDescription>
                <div className='mt-2 space-y-1 text-sm'>
                  <p>Total rows: {result.totalRows}</p>
                  <p className='text-green-600 dark:text-green-400'>
                    Successfully imported: {result.successCount}
                  </p>
                  {result.errorCount > 0 && (
                    <>
                      <p className='text-red-600 dark:text-red-400'>
                        Errors: {result.errorCount}
                      </p>
                      <div className='mt-2 max-h-32 overflow-y-auto rounded border border-red-200 dark:border-red-800 p-2 text-xs'>
                        {result.errors.map((err, i) => (
                          <div key={i} className='mb-1'>
                            <span className='font-medium'>Row {err.rowIndex}:</span>{' '}
                            {err.errors.join(', ')}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className='gap-2'>
          {state === 'success' ? (
            <Button onClick={handleClose} className='w-full sm:w-auto'>
              Done
            </Button>
          ) : (
            <>
              <Button
                variant='outline'
                onClick={handleClose}
                disabled={state === 'uploading'}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || state === 'uploading'}
              >
                {state === 'uploading' ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className='w-4 h-4 mr-2' />
                    Import Prospects
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
