import type { CollectionConfig } from 'payload'

export const Colleges: CollectionConfig = {
  slug: 'colleges',
  admin: {
    useAsTitle: 'school',
    defaultColumns: ['school', 'city', 'state', 'division'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
    description: 'Manage the database of colleges and universities for typeahead/autocomplete',
    group: 'Reference Data',
  },
  access: {
    read: () => true, // Public read access for typeahead
    create: ({ req }) => {
      const user = req.user
      if (!user || user.collection !== 'users') return false
      return user.roles?.includes('admin') || false
    },
    update: ({ req }) => {
      const user = req.user
      if (!user || user.collection !== 'users') return false
      return user.roles?.includes('admin') || false
    },
    delete: () => false, // Prevent deletion of static college data
  },
  fields: [
    {
      name: 'school',
      type: 'text',
      required: true,
      index: true, // Index for fast searches
    },
    {
      name: 'city',
      type: 'text',
      required: true,
    },
    {
      name: 'state',
      type: 'text',
      required: true,
      index: true, // Index for filtering by state
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Private', value: 'private' },
      ],
    },
    {
      name: 'conference',
      type: 'text',
      required: true,
    },
    {
      name: 'division',
      type: 'select',
      required: true,
      index: true, // Index for filtering by division
      options: [
        { label: 'NCAA Division I', value: 'd1' },
        { label: 'NCAA Division II', value: 'd2' },
        { label: 'NCAA Division III', value: 'd3' },
        { label: 'NAIA', value: 'naia' },
        { label: 'JUCO', value: 'juco' },
        { label: 'Other', value: 'other' },
      ],
    },
  ],
}
