import { z } from 'zod';
import { GraduationYearSchema } from './GraduationYears';

export const ProspectSchema = z.object({
  coach: z.string(), // Relationship ID
  name: z.string(),
  uniformNumber: z.string().optional().or(z.literal('')),
  graduationYear: GraduationYearSchema,
  heightInInches: z.number().int().optional(),
  weight: z.number().int().optional(),
  highSchool: z.string().optional().or(z.literal('')),
  aauProgram: z.string().optional().or(z.literal('')),
  tournamentSchedule: z.array(z.string()).optional(), // Array of tournament IDs
  twitterHandle: z.string().optional().or(z.literal('')),
  phoneNumber: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  linkedPlayer: z.string().optional(), // Relationship ID to player
});

export type Prospect = z.infer<typeof ProspectSchema>;