import { z } from 'zod';

// Enums
export const ContactTypeSchema = z.enum([
  'email', 'phone', 'text', 'in-person', 'video', 'game-visit', 'campus-visit', 'other'
]);
export const InterestLevelSchema = z.enum([
  'high', 'medium', 'low', 'watching', 'not-interested'
]);

// Nested Schemas
export const ContactRecordSchema = z.object({
  date: z.string().datetime(), // Payload date fields are ISO strings
  contactType: ContactTypeSchema,
  summary: z.string(),
  followUpNeeded: z.boolean().default(false),
  followUpDate: z.string().datetime().optional(), // Conditional, can be empty
});

export const TagSchema = z.object({
  tag: z.string(),
});

// Main CoachPlayerNotes Schema
export const CoachPlayerNotesSchema = z.object({
  coach: z.string(), // Relationship ID
  player: z.string(), // Relationship ID
  notes: z.string().optional(),
  contactRecords: z.array(ContactRecordSchema).optional(),
  interestLevel: InterestLevelSchema.optional(),
  tags: z.array(TagSchema).optional(),
});

export type CoachPlayerNotes = z.infer<typeof CoachPlayerNotesSchema>;