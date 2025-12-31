import { z } from 'zod'
import type { Coach } from '@/payload-types'

/**
 * Schema for Coach Profile Form
 * Maps to Coach payload type properties
 */
export const CoachProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  collegeId: z.number().min(1, 'Please select a college'),
  collegeName: z.string().min(1, 'College name is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  jobTitle: z.string().min(1, 'Position is required'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  // Profile image is handled via FormData separately
})

export type CoachProfileFormData = z.infer<typeof CoachProfileSchema>

/**
 * Helper to map Coach payload type to form data
 */
export function mapCoachToFormData(coach: Coach): CoachProfileFormData {
  return {
    firstName: coach.firstName,
    lastName: coach.lastName,
    collegeId: coach.collegeId,
    collegeName: coach.collegeName,
    city: coach.city,
    state: coach.state,
    jobTitle: coach.jobTitle,
    phone: coach.phone || '',
    bio: coach.bio || '',
  }
}
