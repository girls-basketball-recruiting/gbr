import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    // Email added by default
    {
      name: 'clerkId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        hidden: true,
        description: 'Clerk ID for synced users. Null for PayloadCMS-only admin users.',
      },
      // This field is optional - null for PayloadCMS admins, populated for Clerk-synced users
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
      defaultValue: ['player'],
      required: true,
      admin: {
        description: 'User roles determine access levels across the platform',
      },
    },
    {
      name: 'firstName',
      type: 'text',
      admin: {
        description: 'First name from Clerk profile',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      admin: {
        description: 'Last name from Clerk profile',
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
