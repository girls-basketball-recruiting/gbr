import type { CollectionConfig } from 'payload'
import { baseUserFields } from './shared/baseFields'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    hidden: true, // Hide from sidebar - managed via Clerk
  },
  fields: [
    // Email added by default
    {
      name: 'clerkId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Clerk ID for synced users. Null for PayloadCMS-only admin users.',
      },
    },
    {
      name: 'roles',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Player', value: 'player' },
        { label: 'Coach', value: 'coach' },
      ],
      hasMany: true,
      required: true,
      admin: {
        readOnly: true,
        description: 'User roles determine access levels across the platform',
      },
    },
    ...baseUserFields,
    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Stripe customer ID for subscription management',
      },
    },
    {
      name: 'stripeSubscriptionId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Stripe subscription ID for subscription management',
      },
    },
    {
      name: 'stripePriceId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Stripe price ID for subscription management',
      },
    },
    {
      name: 'stripeCurrentPeriodEnd',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'End date of the current Stripe billing period',
      },
    },
  ],
  access: {
    // Admin can do everything
    admin: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(user.roles && user.roles.includes('admin'))
    },
    // Only admins can create users directly (webhooks bypass this)
    create: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(user.roles && user.roles.includes('admin'))
    },
    // Users can read their own profile, admins can read all
    read: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      if (user.roles && user.roles.includes('admin')) return true
      // Users can only read their own data
      return {
        id: {
          equals: user.id,
        },
      }
    },
    // Users can update their own profile, admins can update all
    update: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      if (user.roles && user.roles.includes('admin')) return true
      // Users can only update their own data
      return {
        id: {
          equals: user.id,
        },
      }
    },
    // Only admins can delete
    delete: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(user.roles && user.roles.includes('admin'))
    },
  },
}
