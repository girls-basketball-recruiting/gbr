import type { CollectionConfig } from 'payload'

export const SavedPlayers: CollectionConfig = {
  slug: 'saved-players',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['coach', 'player', 'savedAt'],
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
        description: 'The coach who saved this player',
      },
    },
    {
      name: 'player',
      type: 'relationship',
      relationTo: 'players',
      required: true,
      hasMany: false,
      admin: {
        description: 'The player that was saved',
      },
    },
    {
      name: 'savedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: 'When the player was saved',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  access: {
    // Admins can do everything
    admin: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(user.roles && user.roles.includes('admin'))
    },
    // Coaches can read their own saved players
    read: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      if (user.roles && user.roles.includes('admin')) return true

      // Coaches can only read their own saved players
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
    // Coaches can delete their own saved players, admins can delete all
    delete: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      if (user.roles && user.roles.includes('admin')) return true

      // Coaches can only delete their own saved players
      if (user.roles && user.roles.includes('coach')) {
        return {
          coach: {
            equals: user.id,
          },
        }
      }

      return false
    },
    // No update needed - saved players are either created or deleted
    update: () => false,
  },
  indexes: [
    {
      fields: ['coach', 'player'],
      unique: true,
    },
  ],
}
