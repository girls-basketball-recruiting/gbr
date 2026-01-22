import type { CollectionConfig } from 'payload'

export const Tournaments: CollectionConfig = {
  slug: 'tournaments',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'location', 'startDate', 'endDate'],
    description: 'Manage tournaments for players and coaches to discover',
    group: 'Reference Data',
    components: {
      beforeListTable: ['@/components/payload/TournamentScraperActions'],
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Tournament name (e.g., "Nike Elite Youth Basketball League")',
      },
    },
    {
      name: 'city',
      type: 'text',
      required: true,
      admin: {
        description: 'Tournament City (e.g., "Las Vegas")',
      },
    },
    {
      name: 'state',
      type: 'text',
      required: true,
      admin: {
        description: 'Tournament State (e.g., "NV")',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Additional details about the tournament',
      },
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Tournament website URL',
      },
    },
    {
      name: 'sourceId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'External ID from source (e.g., acahoops-123456)',
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  access: {
    // Only admins can create, update, and delete tournaments
    create: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(user.roles && user.roles.includes('admin'))
    },
    update: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(user.roles && user.roles.includes('admin'))
    },
    delete: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(user.roles && user.roles.includes('admin'))
    },
    // Everyone can read tournaments
    read: () => true,
  },
}
