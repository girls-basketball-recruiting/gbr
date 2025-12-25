import type { CollectionConfig } from 'payload'

export const CoachProspects: CollectionConfig = {
  slug: 'coach-prospects',
  admin: {
    useAsTitle: 'lastName',
    defaultColumns: ['name', 'graduationYear', 'highSchool', 'coach'],
    hidden: true, // Hidden from sidebar - accessed via Coach tabs
  },
  fields: [
    {
      name: 'coach',
      type: 'relationship',
      relationTo: 'coaches',
      required: true,
      hasMany: false,
      admin: {
        description: 'The coach who created this prospect entry',
      },
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
      admin: {
        description: 'First name of the prospect',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      admin: {
        description: 'Last name of the prospect',
      },
    },
    {
      name: 'uniformNumber',
      type: 'text',
      admin: {
        description: 'Jersey/uniform number',
      },
    },
    {
      name: 'graduationYear',
      type: 'number',
      required: true,
      admin: {
        description: 'High school graduation year (Class of)',
      },
    },
    {
      name: 'heightInInches',
      type: 'number',
      admin: {
        description: 'Height in total inches',
      },
    },
    {
      name: 'weight',
      type: 'number',
      admin: {
        description: 'Weight in pounds (lbs)',
      },
    },
    {
      name: 'highSchool',
      type: 'text',
      admin: {
        description: 'High school name',
      },
    },
    {
      name: 'aauProgram',
      type: 'text',
      admin: {
        description: 'AAU program/club team',
      },
    },
    {
      name: 'tournamentSchedule',
      type: 'relationship',
      relationTo: 'tournaments',
      hasMany: true,
      admin: {
        description: 'Tournaments this prospect will be attending',
      },
    },
    {
      name: 'twitterHandle',
      type: 'text',
      admin: {
        description: 'Twitter/X handle (e.g., @username)',
      },
    },
    {
      name: 'phoneNumber',
      type: 'text',
      admin: {
        description: 'Phone number for contact',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Private notes about this prospect',
      },
    },
    {
      name: 'linkedPlayer',
      type: 'relationship',
      relationTo: 'players',
      hasMany: false,
      admin: {
        description:
          'Optional: Link to registered player if they join the platform',
      },
    },
  ],
  access: {
    // Coaches can only see their own prospects
    read: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      if (user.roles && user.roles.includes('admin')) return true

      // Return filter to only show prospects belonging to this coach
      return {
        coach: {
          equals: user.id,
        },
      }
    },
    // Only coaches and admins can create prospects
    create: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(
        user.roles &&
          (user.roles.includes('admin') || user.roles.includes('coach')),
      )
    },
    // Coaches can only update their own prospects
    update: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      if (user.roles && user.roles.includes('admin')) return true

      return {
        coach: {
          equals: user.id,
        },
      }
    },
    // Coaches can only delete their own prospects
    delete: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      if (user.roles && user.roles.includes('admin')) return true

      return {
        coach: {
          equals: user.id,
        },
      }
    },
  },
}
