import type { CollectionConfig } from 'payload'

export const CoachPlayerNotes: CollectionConfig = {
  slug: 'coach-player-notes',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['coach', 'player', 'updatedAt'],
  },
  fields: [
    {
      name: 'coach',
      type: 'relationship',
      relationTo: 'coaches',
      required: true,
      hasMany: false,
      admin: {
        description: 'The coach who owns these notes',
      },
    },
    {
      name: 'player',
      type: 'relationship',
      relationTo: 'players',
      required: true,
      hasMany: false,
      admin: {
        description: 'The player these notes are about',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'General notes and observations about the player',
      },
    },
    {
      name: 'contactRecords',
      type: 'array',
      admin: {
        description: 'History of outreach and communication with the player',
      },
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: {
            description: 'Date of contact',
          },
        },
        {
          name: 'contactType',
          type: 'select',
          required: true,
          options: [
            { label: 'Email', value: 'email' },
            { label: 'Phone Call', value: 'phone' },
            { label: 'Text Message', value: 'text' },
            { label: 'In-Person Meeting', value: 'in-person' },
            { label: 'Video Call', value: 'video' },
            { label: 'Game Visit', value: 'game-visit' },
            { label: 'Campus Visit', value: 'campus-visit' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'summary',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Summary of the conversation or interaction',
          },
        },
        {
          name: 'followUpNeeded',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Does this require follow-up?',
          },
        },
        {
          name: 'followUpDate',
          type: 'date',
          admin: {
            description: 'When to follow up',
            condition: (data, siblingData) =>
              siblingData?.followUpNeeded === true,
          },
        },
      ],
    },
    {
      name: 'interestLevel',
      type: 'select',
      options: [
        { label: 'High Interest', value: 'high' },
        { label: 'Medium Interest', value: 'medium' },
        { label: 'Low Interest', value: 'low' },
        { label: 'Watching', value: 'watching' },
        { label: 'Not Interested', value: 'not-interested' },
      ],
      admin: {
        description: 'Current interest level in this player',
      },
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        description: 'Custom tags for organization',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
  ],
  access: {
    // Admins can do everything
    admin: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(user.roles && user.roles.includes('admin'))
    },
    // Coaches can read their own notes
    read: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      if (user.roles && user.roles.includes('admin')) return true

      // Coaches can only read their own notes
      if (user.roles && user.roles.includes('coach')) {
        return {
          coach: {
            equals: user.id,
          },
        }
      }

      return false
    },
    // Only coaches and admins can create
    create: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(
        user.roles &&
        (user.roles.includes('admin') || user.roles.includes('coach')),
      )
    },
    // Coaches can update their own notes, admins can update all
    update: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      if (user.roles && user.roles.includes('admin')) return true

      // Coaches can only update their own notes
      if (user.roles && user.roles.includes('coach')) {
        return {
          coach: {
            equals: user.id,
          },
        }
      }

      return false
    },
    // Coaches can delete their own notes, admins can delete all
    delete: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      if (user.roles && user.roles.includes('admin')) return true

      // Coaches can only delete their own notes
      if (user.roles && user.roles.includes('coach')) {
        return {
          coach: {
            equals: user.id,
          },
        }
      }

      return false
    },
  },
  indexes: [
    {
      fields: ['coach', 'player'],
      unique: true,
    },
  ],
}
