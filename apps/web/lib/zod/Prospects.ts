import { z } from 'zod';

export const ProspectSchema = z.object({
  coach: z.string(), // Relationship ID
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  uniformNumber: z.string().optional().or(z.literal('')),
  // CRITICAL: Must be number to match collection type
  // Form sends string, so we coerce to number
  graduationYear: z.coerce.number().int().min(2020).max(2035),
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