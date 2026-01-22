import { z } from 'zod'
import { BasketballPositionSchema } from './Positions'
import { GraduationYearSchema } from './GraduationYears'
import { StateCodeSchema } from './States'

/**
 * Schema for Player Onboarding Step 1: Basic Info
 * Includes: name, graduationYear, high school, location
 */
export const PlayerBasicInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  graduationYear: z.coerce.number().pipe(GraduationYearSchema),
  highSchool: z.string().min(1, 'High school is required'),
  schoolTeamScheduleUrl: z.string().optional().or(z.literal('')),
  city: z.string().min(1, 'City is required'),
  state: StateCodeSchema, // Required - StateCodeSchema is an enum
  // Contact Info
  phoneNumber: z.string().optional().or(z.literal('')),
  xHandle: z.string().optional().or(z.literal('')),
  instaHandle: z.string().optional().or(z.literal('')),
  tiktokHandle: z.string().optional().or(z.literal('')),
  // Profile image is handled via FormData separately
})

export type PlayerBasicInfoFormData = z.infer<typeof PlayerBasicInfoSchema>

/**
 * Schema for a single award entry
 */
const AwardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  year: z.string().min(1, 'Year is required'),
  description: z.string().optional().or(z.literal('')),
})

/**
 * Schema for Player Onboarding Step 2: Athletic Profile
 * Includes: positions, height, AAU info, stats, videos, awards
 */
export const PlayerAthleticProfileSchema = z.object({
  // Required fields
  primaryPosition: BasketballPositionSchema,
  heightInInches: z.coerce
    .number()
    .int()
    .min(36, 'Height is required')
    .max(108, 'Please enter a valid height'),
  // Optional fields
  secondaryPosition: BasketballPositionSchema.optional().or(z.literal('')),
  aauProgramName: z.string().optional().or(z.literal('')),
  aauTeamName: z.string().optional().or(z.literal('')),
  aauCircuit: z.string().optional().or(z.literal('')),
  aauCoach: z.string().optional().or(z.literal('')),
  aauAgeBracket: z.string().optional().or(z.literal('')),
  ppg: z.string().optional().or(z.literal('')),
  rpg: z.string().optional().or(z.literal('')),
  apg: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
  ncaaId: z.string().optional().or(z.literal('')),
  // Awards array - validate each award if any field is filled
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
})

export type PlayerAthleticProfileFormData = z.infer<typeof PlayerAthleticProfileSchema>

/**
 * Schema for Player Onboarding Step 3: Academic Profile
 * All fields are optional
 */
export const PlayerAcademicProfileSchema = z.object({
  unweightedGpa: z.string().optional().or(z.literal('')),
  weightedGpa: z.string().optional().or(z.literal('')),
  potentialAreasOfStudy: z.array(z.string()).max(3, 'Select up to 3 areas').optional().default([]),
  desiredLevelsOfPlay: z.array(z.string()).max(4, 'Select up to 4 levels').optional().default([]),
  desiredGeographicAreas: z.array(z.string()).max(3, 'Select up to 3 areas').optional().default([]),
  desiredDistanceFromHome: z.string().optional().or(z.literal('')),
  interestedInMilitaryAcademies: z.boolean().optional().default(false),
  interestedInUltraHighAcademics: z.boolean().optional().default(false),
  interestedInFaithBased: z.boolean().optional().default(false),
  interestedInAllGirls: z.boolean().optional().default(false),
  interestedInHBCU: z.boolean().optional().default(false),
})

export type PlayerAcademicProfileFormData = z.infer<typeof PlayerAcademicProfileSchema>
