import {
  withCoach,
  apiSuccess,
  apiError,
  apiValidationError,
  handleApiError,
  parseFormData,
} from '@/lib/api-helpers'
import { create } from '@/lib/payload-helpers'
import {
  ProspectCsvRowSchema,
  CSV_HEADERS,
  parseHeightToInches,
  type CsvImportResult,
  type CsvRowValidationResult,
} from '@/lib/zod/ProspectsCsv'

/**
 * Parse CSV text into rows.
 * Handles quoted fields and various line endings.
 */
function parseCsv(csvText: string): string[][] {
  const lines = csvText.trim().split(/\r?\n/)
  return lines.map((line) => {
    const row: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"'
          i++
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    row.push(current.trim())
    return row
  })
}

/**
 * Map CSV headers to schema field names (case-insensitive).
 */
function mapHeaders(headerRow: string[]): Map<number, string> {
  const headerMap = new Map<number, string>()
  const normalizedExpected = CSV_HEADERS.map((h) => h.toLowerCase())

  headerRow.forEach((header, index) => {
    const normalized = header.toLowerCase().replace(/[^a-z]/g, '')
    const matchIndex = normalizedExpected.findIndex((expected) =>
      expected.includes(normalized) || normalized.includes(expected)
    )

    if (matchIndex !== -1) {
      const matchedHeader = CSV_HEADERS[matchIndex]
      if (matchedHeader) {
        headerMap.set(index, matchedHeader)
      }
    } else {
      // Try exact match after normalizing
      const exactMatch = CSV_HEADERS.find(
        (h) => h.toLowerCase() === header.toLowerCase().trim()
      )
      if (exactMatch) {
        headerMap.set(index, exactMatch)
      }
    }
  })

  return headerMap
}

/**
 * Validate a single row against the schema.
 */
function validateRow(
  row: string[],
  headerMap: Map<number, string>,
  rowIndex: number
): CsvRowValidationResult {
  // Build object from row values
  const rowData: Record<string, string> = {}

  headerMap.forEach((fieldName, colIndex) => {
    rowData[fieldName] = row[colIndex] || ''
  })

  // Validate against schema
  const result = ProspectCsvRowSchema.safeParse(rowData)

  if (result.success) {
    return {
      rowIndex,
      isValid: true,
      data: result.data,
    }
  } else {
    return {
      rowIndex,
      isValid: false,
      errors: result.error.errors.map(
        (e) => `${e.path.join('.')}: ${e.message}`
      ),
    }
  }
}

/**
 * Import prospects from CSV file.
 *
 * Expects FormData with a 'file' field containing the CSV.
 * Returns detailed success/error information for each row.
 */
export const POST = handleApiError(async (req: Request) => {
  const [auth, authError] = await withCoach()
  if (authError) return authError

  // Parse FormData
  const [formData, formError] = await parseFormData(req)
  if (formError) return formError

  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return apiValidationError('No CSV file provided')
  }

  // Validate file type
  const fileName = file.name.toLowerCase()
  if (!fileName.endsWith('.csv')) {
    return apiValidationError('File must be a CSV file')
  }

  // Validate file size (max 1MB)
  if (file.size > 1024 * 1024) {
    return apiValidationError('File size must be less than 1MB')
  }

  // Read file content
  let csvText: string
  try {
    csvText = await file.text()
  } catch {
    return apiError('Failed to read CSV file', 500)
  }

  if (!csvText.trim()) {
    return apiValidationError('CSV file is empty')
  }

  // Parse CSV
  const rows = parseCsv(csvText)

  if (rows.length < 2) {
    return apiValidationError('CSV must have a header row and at least one data row')
  }

  // Map headers
  const headerRow = rows[0]
  if (!headerRow) {
    return apiValidationError('CSV file has no header row')
  }
  const headerMap = mapHeaders(headerRow)

  // Verify required headers are present (only firstName and lastName are required)
  const requiredHeaders = ['firstName', 'lastName']
  const mappedHeaders = Array.from(headerMap.values())
  const missingHeaders = requiredHeaders.filter((h) => !mappedHeaders.includes(h))

  if (missingHeaders.length > 0) {
    return apiValidationError(
      `Missing required columns: ${missingHeaders.join(', ')}`
    )
  }

  // Validate all data rows
  const dataRows = rows.slice(1).filter((row): row is string[] => row.some((cell) => cell.trim()))
  const validationResults: CsvRowValidationResult[] = []

  for (let i = 0; i < dataRows.length; i++) {
    const currentRow = dataRows[i]
    if (!currentRow) continue
    const result = validateRow(currentRow, headerMap, i + 2) // +2 for 1-indexed and header row
    validationResults.push(result)
  }

  // Collect errors
  const errorRows = validationResults.filter((r) => !r.isValid)

  if (errorRows.length > 0) {
    const result: CsvImportResult = {
      success: false,
      totalRows: dataRows.length,
      successCount: 0,
      errorCount: errorRows.length,
      errors: errorRows.map((r) => ({
        rowIndex: r.rowIndex,
        errors: r.errors || [],
      })),
    }
    return apiError(JSON.stringify(result), 400)
  }

  // All rows valid - create prospects
  const validRows = validationResults.filter((r) => r.isValid && r.data)
  const createdProspects: Array<{ id: string; firstName: string; lastName: string }> = []
  const createErrors: Array<{ rowIndex: number; errors: string[] }> = []

  for (const row of validRows) {
    if (!row.data) continue

    try {
      // Parse height to inches (handles both raw inches and feet'inches format)
      const heightInInches = row.data.height
        ? parseHeightToInches(row.data.height)
        : undefined

      const prospect = await create('coach-prospects', {
        coach: auth.coachProfile.id,
        // Required fields
        firstName: row.data.firstName,
        lastName: row.data.lastName,
        // Basic info
        graduationYear: row.data.graduationYear
          ? parseInt(row.data.graduationYear, 10)
          : undefined,
        city: row.data.city || undefined,
        state: row.data.state || undefined,
        highSchool: row.data.highSchool || undefined,
        schoolTeamScheduleUrl: row.data.schoolTeamScheduleUrl || undefined,
        // Athletic profile
        primaryPosition: row.data.primaryPosition || undefined,
        secondaryPosition: row.data.secondaryPosition || undefined,
        heightInInches: heightInInches ?? undefined,
        weight: row.data.weight ? parseInt(row.data.weight, 10) : undefined,
        bio: row.data.bio || undefined,
        // AAU info
        aauProgramName: row.data.aauProgramName || undefined,
        aauTeamName: row.data.aauTeamName || undefined,
        aauCircuit: row.data.aauCircuit || undefined,
        aauCoach: row.data.aauCoach || undefined,
        aauAgeBracket: row.data.aauAgeBracket || undefined,
        // Stats
        ppg: row.data.ppg ? parseFloat(row.data.ppg) : undefined,
        rpg: row.data.rpg ? parseFloat(row.data.rpg) : undefined,
        apg: row.data.apg ? parseFloat(row.data.apg) : undefined,
        // Academic
        unweightedGpa: row.data.unweightedGpa
          ? parseFloat(row.data.unweightedGpa)
          : undefined,
        weightedGpa: row.data.weightedGpa
          ? parseFloat(row.data.weightedGpa)
          : undefined,
        ncaaId: row.data.ncaaId || undefined,
        // Contact info
        phoneNumber: row.data.phoneNumber || undefined,
        xHandle: row.data.xHandle || undefined,
        instaHandle: row.data.instaHandle || undefined,
        tiktokHandle: row.data.tiktokHandle || undefined,
        // Coach-specific
        notes: row.data.notes || undefined,
      })

      createdProspects.push({
        id: prospect.id.toString(),
        firstName: row.data.firstName,
        lastName: row.data.lastName,
      })
    } catch (error) {
      createErrors.push({
        rowIndex: row.rowIndex,
        errors: [
          error instanceof Error
            ? error.message
            : 'Failed to create prospect',
        ],
      })
    }
  }

  const result: CsvImportResult = {
    success: createErrors.length === 0,
    totalRows: dataRows.length,
    successCount: createdProspects.length,
    errorCount: createErrors.length,
    errors: createErrors,
    createdProspects,
  }

  if (createErrors.length > 0 && createdProspects.length === 0) {
    return apiError(JSON.stringify(result), 500)
  }

  return apiSuccess(result, createdProspects.length > 0 ? 201 : 200)
})
