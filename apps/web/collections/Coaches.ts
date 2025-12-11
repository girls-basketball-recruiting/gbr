import type { CollectionConfig } from 'payload'

export const Coaches: CollectionConfig = {
  slug: 'coaches',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      admin: {
        description: 'Link to the Clerk user account',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'college',
      type: 'relationship',
      relationTo: 'colleges',
      required: false,
      admin: {
        description: 'Link to college/university from database',
      },
    },
    {
      name: 'university',
      type: 'text',
      required: true,
      admin: {
        description: 'University name (use this if college not in database)',
      },
    },
    {
      name: 'programName',
      type: 'text',
      admin: {
        description: 'e.g., "Women\'s Basketball"',
      },
    },
    {
      name: 'position',
      type: 'text',
      admin: {
        description:
          'e.g., "Head Coach", "Assistant Coach", "Recruiting Coordinator"',
      },
    },
    {
      name: 'division',
      type: 'select',
      options: [
        { label: 'NCAA D1', value: 'd1' },
        { label: 'NCAA D2', value: 'd2' },
        { label: 'NCAA D3', value: 'd3' },
        { label: 'NAIA', value: 'naia' },
        { label: 'JUCO', value: 'juco' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'state',
      type: 'text',
    },
    {
      name: 'region',
      type: 'select',
      options: [
        { label: 'New England', value: 'new-england' },
        { label: 'Mid-Atlantic', value: 'mid-atlantic' },
        { label: 'Southeast', value: 'southeast' },
        { label: 'Southwest', value: 'southwest' },
        { label: 'Midwest', value: 'midwest' },
        { label: 'Mountain West', value: 'mountain-west' },
        { label: 'West Coast', value: 'west-coast' },
        { label: 'Pacific Northwest', value: 'pacific-northwest' },
      ],
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  access: {
    // Admins can do everything
    admin: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(user.roles && user.roles.includes('admin'))
    },
    // Players can read coach profiles
    read: () => true,
    // Only coaches and admins can create
    create: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(
        user.roles &&
        (user.roles.includes('admin') || user.roles.includes('coach')),
      )
    },
    // Coaches can update their own profile, admins can update all
    update: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      if (user.roles && user.roles.includes('admin')) return true
      // Coaches can only update their own profile
      return {
        user: {
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
