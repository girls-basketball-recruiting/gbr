import { z } from 'zod'

/**
 * Parse height string to inches.
 * Accepts formats like: "71", "5'11", "5'11\"", "5-11", "5 11"
 * Returns null if invalid or empty.
 */
export function parseHeightToInches(value: string): number | null {
  if (!value || value.trim() === '') return null

  const trimmed = value.trim()

  // Try parsing as plain number (already in inches)
  const plainNum = parseInt(trimmed, 10)
  if (!isNaN(plainNum) && /^\d+$/.test(trimmed)) {
    return plainNum
  }

  // Try parsing feet/inches formats: 5'11, 5'11", 5-11, 5 11
  const feetInchesRegex = /^(\d+)['\-\s]+(\d+)"?$/
  const match = trimmed.match(feetInchesRegex)
  if (match && match[1] && match[2]) {
    const feet = parseInt(match[1], 10)
    const inches = parseInt(match[2], 10)
    if (!isNaN(feet) && !isNaN(inches) && inches < 12) {
      return feet * 12 + inches
    }
  }

  return null
}

/**
 * Schema for a single row in the prospects CSV import.
 * All fields are strings from CSV, with validation and optional coercion.
 * Only firstName and lastName are required.
 */
export const ProspectCsvRowSchema = z.object({
  // Required fields
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name is too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name is too long'),

  // Basic info
  graduationYear: z
    .string()
    .optional()
    .default('')
    .refine(
      (val) => {
        if (!val || val === '') return true
        return /^\d{4}$/.test(val)
      },
      { message: 'Graduation year must be a 4-digit year' }
    )
    .refine(
      (val) => {
        if (!val || val === '') return true
        const year = parseInt(val, 10)
        return year >= 2020 && year <= 2035
      },
      { message: 'Graduation year must be between 2020 and 2035' }
    ),
  city: z.string().max(100).optional().default(''),
  state: z.string().max(100).optional().default(''),
  highSchool: z.string().max(200).optional().default(''),
  schoolTeamScheduleUrl: z.string().max(500).optional().default(''),

  // Athletic profile
  primaryPosition: z.string().max(50).optional().default(''),
  secondaryPosition: z.string().max(50).optional().default(''),
  // Height can be in inches (e.g., "71") OR feet/inches (e.g., "5'11", "5-11")
  height: z
    .string()
    .optional()
    .default('')
    .refine(
      (val) => {
        if (!val || val === '') return true
        const inches = parseHeightToInches(val)
        return inches !== null && inches >= 48 && inches <= 96
      },
      { message: 'Height must be between 48 and 96 inches (4\'0" to 8\'0"). Use inches (e.g., 71) or feet\'inches (e.g., 5\'11)' }
    ),
  weight: z
    .string()
    .optional()
    .default('')
    .refine(
      (val) => {
        if (!val || val === '') return true
        const num = parseInt(val, 10)
        return !isNaN(num) && num >= 80 && num <= 400
      },
      { message: 'Weight must be between 80 and 400 lbs' }
    ),
  bio: z.string().max(2000).optional().default(''),

  // AAU info
  aauProgramName: z.string().max(200).optional().default(''),
  aauTeamName: z.string().max(200).optional().default(''),
  aauCircuit: z.string().max(100).optional().default(''),
  aauCoach: z.string().max(200).optional().default(''),
  aauAgeBracket: z.string().max(50).optional().default(''),

  // Stats
  ppg: z
    .string()
    .optional()
    .default('')
    .refine(
      (val) => {
        if (!val || val === '') return true
        const num = parseFloat(val)
        return !isNaN(num) && num >= 0 && num <= 100
      },
      { message: 'PPG must be a number between 0 and 100' }
    ),
  rpg: z
    .string()
    .optional()
    .default('')
    .refine(
      (val) => {
        if (!val || val === '') return true
        const num = parseFloat(val)
        return !isNaN(num) && num >= 0 && num <= 50
      },
      { message: 'RPG must be a number between 0 and 50' }
    ),
  apg: z
    .string()
    .optional()
    .default('')
    .refine(
      (val) => {
        if (!val || val === '') return true
        const num = parseFloat(val)
        return !isNaN(num) && num >= 0 && num <= 30
      },
      { message: 'APG must be a number between 0 and 30' }
    ),

  // Academic
  unweightedGpa: z
    .string()
    .optional()
    .default('')
    .refine(
      (val) => {
        if (!val || val === '') return true
        const num = parseFloat(val)
        return !isNaN(num) && num >= 0 && num <= 4.0
      },
      { message: 'Unweighted GPA must be between 0 and 4.0' }
    ),
  weightedGpa: z
    .string()
    .optional()
    .default('')
    .refine(
      (val) => {
        if (!val || val === '') return true
        const num = parseFloat(val)
        return !isNaN(num) && num >= 0 && num <= 5.0
      },
      { message: 'Weighted GPA must be between 0 and 5.0' }
    ),
  ncaaId: z.string().max(50).optional().default(''),

  // Contact info
  phoneNumber: z.string().max(30).optional().default(''),
  xHandle: z.string().max(50).optional().default(''),
  instaHandle: z.string().max(50).optional().default(''),
  tiktokHandle: z.string().max(50).optional().default(''),

  // Coach-specific
  notes: z.string().max(2000).optional().default(''),
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
 * Only firstName and lastName are required.
 */
export const CSV_HEADERS = [
  // Required
  'firstName',
  'lastName',
  // Basic info
  'graduationYear',
  'city',
  'state',
  'highSchool',
  'schoolTeamScheduleUrl',
  // Athletic profile
  'primaryPosition',
  'secondaryPosition',
  'height',
  'weight',
  'bio',
  // AAU info
  'aauProgramName',
  'aauTeamName',
  'aauCircuit',
  'aauCoach',
  'aauAgeBracket',
  // Stats
  'ppg',
  'rpg',
  'apg',
  // Academic
  'unweightedGpa',
  'weightedGpa',
  'ncaaId',
  // Contact info
  'phoneNumber',
  'xHandle',
  'instaHandle',
  'tiktokHandle',
  // Coach-specific
  'notes',
] as const

/**
 * Human-readable header labels for UI display.
 */
export const CSV_HEADER_LABELS: Record<string, string> = {
  firstName: 'First Name*',
  lastName: 'Last Name*',
  graduationYear: 'Graduation Year',
  city: 'City',
  state: 'State',
  highSchool: 'High School',
  schoolTeamScheduleUrl: 'School Team Schedule URL',
  primaryPosition: 'Primary Position',
  secondaryPosition: 'Secondary Position',
  height: 'Height (inches or ft\'in)',
  weight: 'Weight (lbs)',
  bio: 'Bio',
  aauProgramName: 'AAU Program Name',
  aauTeamName: 'AAU Team Name',
  aauCircuit: 'AAU Circuit',
  aauCoach: 'AAU Coach',
  aauAgeBracket: 'AAU Age Bracket',
  ppg: 'Points Per Game',
  rpg: 'Rebounds Per Game',
  apg: 'Assists Per Game',
  unweightedGpa: 'Unweighted GPA',
  weightedGpa: 'Weighted GPA',
  ncaaId: 'NCAA ID',
  phoneNumber: 'Phone Number',
  xHandle: 'X/Twitter Handle',
  instaHandle: 'Instagram Handle',
  tiktokHandle: 'TikTok Handle',
  notes: 'Notes',
}

/**
 * Generate a sample CSV for download.
 * Only required fields (firstName, lastName) plus a few common optional fields.
 */
export function generateSampleCsv(): string {
  // Use a minimal set of common fields for the sample
  const sampleHeaders = [
    'firstName',
    'lastName',
    'graduationYear',
    'height',
    'weight',
    'highSchool',
    'city',
    'state',
    'primaryPosition',
    'phoneNumber',
  ]
  const headers = sampleHeaders.join(',')
  const sampleRow = [
    'Jane',
    'Doe',
    '2026',
    "5'11",
    '145',
    'Lincoln High School',
    'Chicago',
    'IL',
    'PG',
    '555-123-4567',
  ].join(',')
  return `${headers}\n${sampleRow}`
}
