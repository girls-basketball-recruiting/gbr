import { z } from 'zod'
import { BasketballPositionSchema } from './Positions'

/**
 * Schema for a single award entry (optional within array)
 */
const AwardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  year: z.string().min(1, 'Year is required'),
  description: z.string().optional().or(z.literal('')),
})

/**
 * Schema for Prospect - matches Player profile structure
 * Only firstName and lastName are required; everything else is optional
 */
export const ProspectSchema = z.object({
  // Ownership (set by server, not in form)
  coach: z.string().optional(),

  // Required Fields
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),

  // Profile Image (handled via FormData separately)
  profileImageUrl: z.string().optional().or(z.literal('')),

  // Basic Info
  graduationYear: z.coerce.number().int().min(2020).max(2035).optional().nullable(),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  highSchool: z.string().optional().or(z.literal('')),
  schoolTeamScheduleUrl: z.string().optional().or(z.literal('')),

  // Athletic Profile
  primaryPosition: BasketballPositionSchema.optional().or(z.literal('')),
  secondaryPosition: BasketballPositionSchema.optional().or(z.literal('')),
  heightInInches: z.coerce.number().int().min(36).max(108).optional().nullable(),
  weight: z.coerce.number().int().optional().nullable(),
  bio: z.string().optional().or(z.literal('')),

  // AAU Info
  aauProgramName: z.string().optional().or(z.literal('')),
  aauTeamName: z.string().optional().or(z.literal('')),
  aauCircuit: z.string().optional().or(z.literal('')),
  aauCoach: z.string().optional().or(z.literal('')),
  aauAgeBracket: z.string().optional().or(z.literal('')),

  // Stats
  ppg: z.string().optional().or(z.literal('')),
  rpg: z.string().optional().or(z.literal('')),
  apg: z.string().optional().or(z.literal('')),

  // Academic
  unweightedGpa: z.string().optional().or(z.literal('')),
  weightedGpa: z.string().optional().or(z.literal('')),
  potentialAreasOfStudy: z.array(z.string()).max(3, 'Select up to 3 areas').optional().default([]),
  ncaaId: z.string().optional().or(z.literal('')),

  // Awards
  awards: z
    .array(AwardSchema.partial().refine(
      (award) => {
        // If any field has content, require title and year
        const hasContent = award.title || award.year || award.description
        if (hasContent) {
          return award.title && award.title.trim() !== '' && award.year && award.year.trim() !== ''
        }
        return true
      },
      {
        message: 'Title and Year are required when adding an award',
      }
    ))
    .max(10, 'Maximum 10 awards allowed')
    .optional()
    .default([]),

  // Highlight Videos
  highlightVideoUrls: z
    .array(z.object({ url: z.string() }))
    .max(10, 'Maximum 10 videos allowed')
    .optional()
    .default([]),

  // Tournament Schedule
  tournamentSchedule: z.array(z.string()).optional().default([]),

  // College Preferences
  desiredLevelsOfPlay: z.array(z.string()).max(4, 'Select up to 4 levels').optional().default([]),
  desiredGeographicAreas: z.array(z.string()).max(3, 'Select up to 3 areas').optional().default([]),
  desiredDistanceFromHome: z.string().optional().or(z.literal('')),
  interestedInMilitaryAcademies: z.boolean().optional().default(false),
  interestedInUltraHighAcademics: z.boolean().optional().default(false),
  interestedInFaithBased: z.boolean().optional().default(false),
  interestedInAllGirls: z.boolean().optional().default(false),
  interestedInHBCU: z.boolean().optional().default(false),

  // Contact Info
  phoneNumber: z.string().optional().or(z.literal('')),
  xHandle: z.string().optional().or(z.literal('')),
  instaHandle: z.string().optional().or(z.literal('')),
  tiktokHandle: z.string().optional().or(z.literal('')),

  // Coach-specific fields
  notes: z.string().optional().or(z.literal('')),
  linkedPlayer: z.string().optional(),
})

export type Prospect = z.infer<typeof ProspectSchema>
