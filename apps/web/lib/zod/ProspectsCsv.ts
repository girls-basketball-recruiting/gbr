import { z } from 'zod'

/**
 * Schema for a single row in the prospects CSV import.
 * All fields are strings from CSV, with validation and optional coercion.
 */
export const ProspectCsvRowSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name is too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name is too long'),
  graduationYear: z
    .string()
    .regex(/^\d{4}$/, 'Graduation year must be a 4-digit year')
    .refine(
      (val) => {
        const year = parseInt(val, 10)
        return year >= 2020 && year <= 2035
      },
      { message: 'Graduation year must be between 2020 and 2035' }
    ),
  uniformNumber: z.string().max(10).optional().default(''),
  heightInInches: z
    .string()
    .optional()
    .default('')
    .refine(
      (val) => {
        if (!val || val === '') return true
        const num = parseInt(val, 10)
        return !isNaN(num) && num >= 48 && num <= 84
      },
      { message: 'Height must be between 48 and 84 inches' }
    ),
  weight: z
    .string()
    .optional()
    .default('')
    .refine(
      (val) => {
        if (!val || val === '') return true
        const num = parseInt(val, 10)
        return !isNaN(num) && num >= 80 && num <= 300
      },
      { message: 'Weight must be between 80 and 300 lbs' }
    ),
  highSchool: z.string().max(200).optional().default(''),
  aauProgram: z.string().max(200).optional().default(''),
  twitterHandle: z.string().max(50).optional().default(''),
  phoneNumber: z.string().max(20).optional().default(''),
  notes: z.string().max(1000).optional().default(''),
})

export type ProspectCsvRow = z.infer<typeof ProspectCsvRowSchema>

/**
 * Schema for the entire CSV import request.
 */
export const ProspectCsvImportSchema = z.object({
  rows: z.array(ProspectCsvRowSchema).min(1, 'At least one prospect is required'),
})

export type ProspectCsvImport = z.infer<typeof ProspectCsvImportSchema>

/**
 * Result of validating a single CSV row.
 */
export interface CsvRowValidationResult {
  rowIndex: number
  isValid: boolean
  data?: ProspectCsvRow
  errors?: string[]
}

/**
 * Result of the entire CSV import operation.
 */
export interface CsvImportResult {
  success: boolean
  totalRows: number
  successCount: number
  errorCount: number
  errors: Array<{
    rowIndex: number
    errors: string[]
  }>
  createdProspects?: Array<{ id: string; firstName: string; lastName: string }>
}

/**
 * Expected CSV headers (case-insensitive).
 */
export const CSV_HEADERS = [
  'firstName',
  'lastName',
  'graduationYear',
  'uniformNumber',
  'heightInInches',
  'weight',
  'highSchool',
  'aauProgram',
  'twitterHandle',
  'phoneNumber',
  'notes',
] as const

/**
 * Human-readable header labels for UI display.
 */
export const CSV_HEADER_LABELS: Record<string, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  graduationYear: 'Graduation Year',
  uniformNumber: 'Uniform Number',
  heightInInches: 'Height (inches)',
  weight: 'Weight (lbs)',
  highSchool: 'High School',
  aauProgram: 'AAU Program',
  twitterHandle: 'Twitter Handle',
  phoneNumber: 'Phone Number',
  notes: 'Notes',
}

/**
 * Generate a sample CSV for download.
 */
export function generateSampleCsv(): string {
  const headers = CSV_HEADERS.join(',')
  const sampleRow = [
    'Jane',
    'Doe',
    '2026',
    '23',
    '68',
    '145',
    'Lincoln High School',
    'Elite Ballers',
    '@janedoe',
    '555-123-4567',
    'Great shooter',
  ].join(',')
  return `${headers}\n${sampleRow}`
}
