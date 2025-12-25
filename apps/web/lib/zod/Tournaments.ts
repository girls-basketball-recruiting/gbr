import { z } from 'zod';

export const TournamentSchema = z.object({
  name: z.string(),
  location: z.string(),
  startDate: z.string().datetime(), // ISO string for date
  endDate: z.string().datetime(),   // ISO string for date
  description: z.string().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

export type Tournament = z.infer<typeof TournamentSchema>;