import { z } from 'zod';

export const CollegeTypeSchema = z.enum(['public', 'private']);
export const CollegeDivisionSchema = z.enum(['d1', 'd2', 'd3', 'naia', 'juco', 'other']);

export const CollegeSchema = z.object({
  school: z.string(),
  city: z.string(),
  state: z.string(), // Assuming state is a string code like "CA", "NY"
  type: CollegeTypeSchema,
  conference: z.string(),
  division: CollegeDivisionSchema,
});

export type College = z.infer<typeof CollegeSchema>;