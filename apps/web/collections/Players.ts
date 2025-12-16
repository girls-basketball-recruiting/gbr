import type { CollectionConfig } from 'payload'
import { getPositionOptions } from '../types/positions'

export const Players: CollectionConfig = {
  slug: 'players',
  admin: {
    useAsTitle: 'firstName',
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
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'graduationYear',
      type: 'number',
      required: true,
      admin: {
        description: 'High school graduation year',
      },
    },
    {
      name: 'city',
      type: 'text',
    },
    {
      name: 'state',
      type: 'text',
    },
    {
      name: 'highSchool',
      type: 'text',
      required: true,
    },
    {
      name: 'height',
      type: 'text',
      admin: {
        description: 'e.g., "5\'10"',
      },
    },
    {
      name: 'heightInInches',
      type: 'number',
      admin: {
        description: 'Height in total inches (auto-calculated from height field)',
      },
    },
    {
      name: 'weightedGpa',
      type: 'number',
    },
    {
      name: 'unweightedGpa',
      type: 'number',
    },
    {
      name: 'primaryPosition',
      type: 'select',
      options: getPositionOptions(),
      required: true,
    },
    {
      name: 'secondaryPosition',
      type: 'select',
      options: getPositionOptions(),
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description:
          'Tell coaches about yourself, your playing style, and goals',
      },
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'highlightVideoUrls',
      type: 'array',
      maxRows: 10,
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Add up to 10 highlight video URLs (YouTube, Hudl, etc.)',
      },
    },
    {
      name: 'tournamentSchedule',
      type: 'relationship',
      relationTo: 'tournaments',
      hasMany: true,
      admin: {
        description:
          'Select tournaments you will be attending during exposure periods',
      },
    },
    {
      name: 'deletedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Soft delete timestamp - if set, profile is archived',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Auto-calculate heightInInches from height field (format: "5'10"")
        if (data?.height && typeof data.height === 'string') {
          const match = data.height.match(/(\d+)'(\d+)"?/)
          if (match) {
            const feet = parseInt(match[1] || '0')
            const inches = parseInt(match[2] || '0')
            data.heightInInches = feet * 12 + inches
          }
        }
        return data
      },
    ],
  },
  access: {
    // Admins can do everything
    admin: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(user.roles && user.roles.includes('admin'))
    },
    // Coaches can read player profiles
    read: () => true,
    // Only players and admins can create
    create: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(
        user.roles &&
        (user.roles.includes('admin') || user.roles.includes('player')),
      )
    },
    // Players can update their own profile, admins can update all
    update: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      if (user.roles && user.roles.includes('admin')) return true
      // Players can only update their own profile
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
