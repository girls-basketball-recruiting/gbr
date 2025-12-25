import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'player', 'coach']);

export const UserSchema = z.object({
  clerkId: z.string().optional(),
  roles: z.array(UserRoleSchema).default(['player']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  stripePriceId: z.string().optional(),
  stripeCurrentPeriodEnd: z.string().datetime().optional(),
});

export type User = z.infer<typeof UserSchema>;