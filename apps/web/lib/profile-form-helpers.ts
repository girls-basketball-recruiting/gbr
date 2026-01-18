/**
 * Shared utilities for parsing and transforming profile form data.
 *
 * Used by both Player and Prospect API routes to ensure consistent
 * handling of FormData, JSON parsing, and field transformation.
 */

import { uploadProfileImage } from '@/lib/blob-storage'

// ============================================================================
// FormData Parsing Utilities
// ============================================================================

/**
 * Safely get a string value from FormData.
 * Returns undefined if the value is null, empty, or not a string.
 */
export function getStringField(formData: FormData, field: string): string | undefined {
  const value = formData.get(field)
  if (value === null || value === undefined) return undefined
  if (typeof value !== 'string') return undefined
  return value.trim() || undefined
}

/**
 * Safely get a required string value from FormData.
 * Returns the string value even if empty (for required fields).
 */
export function getRequiredStringField(formData: FormData, field: string): string {
  const value = formData.get(field)
  if (typeof value === 'string') return value
  return ''
}

/**
 * Parse a JSON field from FormData.
 * Returns undefined if parsing fails or field is missing.
 */
export function parseJsonField<T = unknown>(formData: FormData, field: string): T | undefined {
  const value = formData.get(field)
  if (!value || typeof value !== 'string') return undefined
  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

/**
 * Parse a number field from FormData.
 * Returns undefined if the value is not a valid number.
 */
export function getNumberField(formData: FormData, field: string): number | undefined {
  const value = formData.get(field)
  if (!value || typeof value !== 'string') return undefined
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? undefined : parsed
}

/**
 * Parse a float field from FormData.
 * Returns undefined if the value is not a valid number.
 */
export function getFloatField(formData: FormData, field: string): number | undefined {
  const value = formData.get(field)
  if (!value || typeof value !== 'string') return undefined
  const parsed = parseFloat(value)
  return isNaN(parsed) ? undefined : parsed
}

/**
 * Parse a boolean field from FormData.
 * Handles string 'true'/'false' conversion.
 */
export function getBooleanField(formData: FormData, field: string): boolean {
  const value = formData.get(field)
  return value === 'true'
}

// ============================================================================
// Profile Image Handling
// ============================================================================

/**
 * Handle profile image upload from FormData.
 * Returns the new image URL if uploaded, undefined otherwise.
 */
export async function handleProfileImageUpload(
  formData: FormData,
  userId: string | number,
  userType: 'player' | 'prospect',
  existingImageUrl?: string | null
): Promise<string | undefined> {
  const profileImage = formData.get('profileImage')

  if (
    profileImage &&
    profileImage instanceof File &&
    profileImage.size > 0 &&
    profileImage.name
  ) {
    try {
      return await uploadProfileImage(
        profileImage,
        userId,
        userType === 'prospect' ? 'player' : userType, // prospects use player folder
        existingImageUrl || undefined
      )
    } catch (error) {
      console.error(`Error uploading ${userType} profile image:`, error)
    }
  }

  return undefined
}

// ============================================================================
// Field Definitions for Profile Data
// ============================================================================

/**
 * Common text fields shared between Player and Prospect profiles.
 */
export const PROFILE_TEXT_FIELDS = [
  'firstName',
  'lastName',
  'graduationYear',
  'highSchool',
  'city',
  'state',
  'primaryPosition',
  'secondaryPosition',
  'phoneNumber',
  'email',
  'xHandle',
  'instaHandle',
  'tiktokHandle',
  'ncaaId',
  'bio',
  'desiredDistanceFromHome',
  'aauProgramName',
  'aauTeamName',
  'aauCircuit',
  'aauCoach',
  'notes', // Prospect-only but harmless to include
] as const

/**
 * Number fields (parsed as integers).
 */
export const PROFILE_NUMBER_FIELDS = [
  'heightInInches',
  'weight',
] as const

/**
 * Float fields (parsed as floats) - stats.
 */
export const PROFILE_FLOAT_FIELDS = [
  'ppg',
  'rpg',
  'apg',
  'unweightedGpa',
  'weightedGpa',
] as const

/**
 * Boolean fields (checkboxes).
 */
export const PROFILE_BOOLEAN_FIELDS = [
  'interestedInMilitaryAcademies',
  'interestedInUltraHighAcademics',
  'interestedInFaithBased',
  'interestedInAllGirls',
  'interestedInHBCU',
] as const

/**
 * JSON array fields.
 */
export const PROFILE_JSON_FIELDS = [
  'desiredLevelsOfPlay',
  'desiredGeographicAreas',
  'potentialAreasOfStudy',
  'awards',
  'highlightVideoUrls',
  'tournamentSchedule',
] as const

// ============================================================================
// Profile Data Extraction
// ============================================================================

export interface ProfileFormData {
  // Text fields
  firstName?: string
  lastName?: string
  graduationYear?: string
  highSchool?: string
  city?: string
  state?: string
  primaryPosition?: string
  secondaryPosition?: string
  phoneNumber?: string
  email?: string
  xHandle?: string
  instaHandle?: string
  tiktokHandle?: string
  ncaaId?: string
  bio?: string
  desiredDistanceFromHome?: string
  aauProgramName?: string
  aauTeamName?: string
  aauCircuit?: string
  aauCoach?: string
  notes?: string

  // Number fields
  heightInInches?: number
  weight?: number

  // Float fields
  ppg?: number
  rpg?: number
  apg?: number
  unweightedGpa?: number
  weightedGpa?: number

  // Boolean fields
  interestedInMilitaryAcademies?: boolean
  interestedInUltraHighAcademics?: boolean
  interestedInFaithBased?: boolean
  interestedInAllGirls?: boolean
  interestedInHBCU?: boolean

  // Array/JSON fields
  desiredLevelsOfPlay?: string[]
  desiredGeographicAreas?: string[]
  potentialAreasOfStudy?: string[]
  awards?: Array<{ title: string; year: string; description?: string }>
  highlightVideoUrls?: Array<{ url: string }>
  tournamentSchedule?: string[]

  // Image URL (set after upload)
  profileImageUrl?: string
}

/**
 * Extract all profile fields from FormData into a typed object.
 * Handles text, number, float, boolean, and JSON fields.
 */
export function extractProfileDataFromFormData(formData: FormData): ProfileFormData {
  const data: ProfileFormData = {}

  // Extract text fields
  for (const field of PROFILE_TEXT_FIELDS) {
    const value = getStringField(formData, field)
    if (value) {
      (data as any)[field] = value
    }
  }

  // Extract number fields
  for (const field of PROFILE_NUMBER_FIELDS) {
    const value = getNumberField(formData, field)
    if (value !== undefined) {
      (data as any)[field] = value
    }
  }

  // Extract float fields
  for (const field of PROFILE_FLOAT_FIELDS) {
    const value = getFloatField(formData, field)
    if (value !== undefined) {
      (data as any)[field] = value
    }
  }

  // Extract boolean fields
  for (const field of PROFILE_BOOLEAN_FIELDS) {
    const value = formData.get(field)
    if (value !== null) {
      (data as any)[field] = value === 'true'
    }
  }

  // Extract JSON fields
  for (const field of PROFILE_JSON_FIELDS) {
    const value = parseJsonField(formData, field)
    if (value !== undefined) {
      // Special handling for highlightVideoUrls - filter empty URLs
      if (field === 'highlightVideoUrls' && Array.isArray(value)) {
        const filtered = (value as Array<{ url: string }>)
          .filter((v) => v.url?.trim())
          .map((v) => ({ url: v.url.trim() }))
        if (filtered.length > 0) {
          (data as any)[field] = filtered
        }
      }
      // Special handling for awards - filter empty entries
      else if (field === 'awards' && Array.isArray(value)) {
        const filtered = (value as Array<{ title?: string; year?: string; description?: string }>)
          .filter((a) => a.title?.trim() || a.year?.trim())
        if (filtered.length > 0) {
          (data as any)[field] = filtered
        }
      }
      // Other JSON fields pass through
      else {
        (data as any)[field] = value
      }
    }
  }

  return data
}

/**
 * Parse JSON body data for profile updates (non-FormData requests).
 * Normalizes the data structure to match FormData extraction.
 */
export function normalizeProfileJsonData(data: Record<string, any>): ProfileFormData {
  const result: ProfileFormData = {}

  // Copy text fields
  for (const field of PROFILE_TEXT_FIELDS) {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      (result as any)[field] = String(data[field])
    }
  }

  // Parse and copy number fields
  for (const field of PROFILE_NUMBER_FIELDS) {
    if (data[field] !== undefined && data[field] !== null) {
      const parsed = parseInt(String(data[field]), 10)
      if (!isNaN(parsed)) {
        (result as any)[field] = parsed
      }
    }
  }

  // Parse and copy float fields
  for (const field of PROFILE_FLOAT_FIELDS) {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      const parsed = parseFloat(String(data[field]))
      if (!isNaN(parsed)) {
        (result as any)[field] = parsed
      }
    }
  }

  // Copy boolean fields
  for (const field of PROFILE_BOOLEAN_FIELDS) {
    if (data[field] !== undefined) {
      (result as any)[field] = Boolean(data[field])
    }
  }

  // Copy array/JSON fields with filtering
  if (data.highlightVideoUrls && Array.isArray(data.highlightVideoUrls)) {
    const filtered = data.highlightVideoUrls
      .filter((v: any) => v?.url?.trim())
      .map((v: any) => ({ url: v.url.trim() }))
    if (filtered.length > 0) {
      result.highlightVideoUrls = filtered
    }
  }

  if (data.awards && Array.isArray(data.awards)) {
    const filtered = data.awards.filter((a: any) => a?.title?.trim() || a?.year?.trim())
    if (filtered.length > 0) {
      result.awards = filtered
    }
  }

  // Other array fields pass through
  for (const field of ['desiredLevelsOfPlay', 'desiredGeographicAreas', 'potentialAreasOfStudy', 'tournamentSchedule'] as const) {
    if (data[field] && Array.isArray(data[field])) {
      (result as any)[field] = data[field]
    }
  }

  return result
}
