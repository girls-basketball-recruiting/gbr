import { z } from 'zod';
import { AauCircuitSchema } from './AauCircuits';
import { AreaOfStudySchema } from './AreasOfStudy';
import { LevelOfPlaySchema } from './LevelsOfPlay';
import { GeographicAreaSchema } from './GeographicAreas';
import { DistanceFromHomeSchema } from './DistanceFromHome';
import { BasketballPositionSchema } from './Positions'; // Assuming this is the current one
import { GraduationYearSchema } from './GraduationYears';
import { StateCodeSchema } from './States';

// Nested Schemas
export const HighlightVideoUrlSchema = z.object({
  url: z.string().url(),
});

export const AwardSchema = z.object({
  title: z.string(),
});

export const PlayerSchema = z.object({
  user: z.string(), // Relationship to clerk user
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  graduationYear: GraduationYearSchema,
  city: z.string().optional().or(z.literal('')),
  state: StateCodeSchema.optional(), // Using the StateCodeSchema for validation
  highSchool: z.string(),
  awards: z.array(AwardSchema).max(10).optional(),
  aauProgram: z.string().optional().or(z.literal('')),
  heightInInches: z.number().int().min(36, "Height is required").max(108),
  weight: z.number().int().optional(),
  unweightedGpa: z.number().optional(),
  weightedGpa: z.number().optional(),
  potentialAreasOfStudy: z.array(AreaOfStudySchema).optional(),
  primaryPosition: BasketballPositionSchema,
  secondaryPosition: BasketballPositionSchema.optional(),
  bio: z.string().optional().or(z.literal('')),
  aauTeam: z.string().optional().or(z.literal('')),
  aauCircuit: AauCircuitSchema.optional(),
  aauCoach: z.string().optional().or(z.literal('')),
  phoneNumber: z.string().optional().or(z.literal('')),
  xHandle: z.string().optional().or(z.literal('')),
  instaHandle: z.string().optional().or(z.literal('')),
  tiktokHandle: z.string().optional().or(z.literal('')),
  ncaaId: z.string().optional().or(z.literal('')),
  profileImage: z.string().optional(), // Relationship to media, stores media ID as a string
  highlightVideoUrls: z.array(HighlightVideoUrlSchema).max(10).optional(),
  tournamentSchedule: z.array(z.string()).optional(), // Array of tournament IDs
  ppg: z.number().optional(),
  rpg: z.number().optional(),
  apg: z.number().optional(),
  desiredLevelsOfPlay: z.array(LevelOfPlaySchema).optional(),
  desiredGeographicAreas: z.array(GeographicAreaSchema).optional(),
  desiredDistanceFromHome: DistanceFromHomeSchema.optional(),
  interestedInMilitaryAcademies: z.boolean().optional(),
  interestedInUltraHighAcademics: z.boolean().optional(),
  interestedInFaithBased: z.boolean().optional(),
  interestedInAllGirls: z.boolean().optional(),
  interestedInHBCU: z.boolean().optional(),
  // Legacy field - keep for backward compatibility but hidden from forms typically
  desiredLevelOfPlay: LevelOfPlaySchema.optional(),
  isActive: z.boolean().default(true),
  isCommitted: z.boolean().optional(),
  committedWhere: z.string().optional().or(z.literal('')), // Conditional based on isCommitted
  deletedAt: z.string().datetime().optional(),
});

export type Player = z.infer<typeof PlayerSchema>;