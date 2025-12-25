import { z } from 'zod';

export const SavedPlayerSchema = z.object({
  coach: z.string(), // Relationship ID
  player: z.string(), // Relationship ID
  savedAt: z.string().datetime().default(() => new Date().toISOString()), // ISO string, defaults to current time
});

export type SavedPlayer = z.infer<typeof SavedPlayerSchema>;