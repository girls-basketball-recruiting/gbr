import { z } from 'zod'

export const CoachSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  // Email comes from Clerk, not rendered in form
  email: z.string().email('Valid email is required').optional(),
  collegeId: z.number().min(1, 'Please select a college'),
  collegeName: z.string().min(1, 'College name is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  jobTitle: z.string().min(1, 'Position is required'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  profileImageUrl: z.string().optional(),
})

export type CoachFormData = z.infer<typeof CoachSchema>
