import type { CollectionConfig } from 'payload'

export const PlayerSavedPrograms: CollectionConfig = {
  slug: 'player-saved-programs',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['player', 'college', 'savedAt'],
    description: 'Programs saved by players for their college search',
  },
  fields: [
    {
      name: 'player',
      type: 'relationship',
      relationTo: 'players',
      required: true,
      index: true,
      admin: {
        description: 'The player who saved this program',
      },
    },
    {
      name: 'college',
      type: 'relationship',
      relationTo: 'colleges',
      required: true,
      index: true,
      admin: {
        description: 'The college program that was saved',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Private notes about this program (only visible to the player)',
      },
    },
    {
      name: 'savedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'When this program was saved',
      },
      defaultValue: () => new Date().toISOString(),
    },
  ],
  access: {
    // Players can only read their own saved programs
    read: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false

      if (user.roles && user.roles.includes('admin')) return true

      if (user.roles && user.roles.includes('player')) {
        // Get player record for this user
        return {
          'player.user': {
            equals: user.id,
          },
        }
      }

      return false
    },
    // Players can create their own saved programs
    create: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(user.roles && (user.roles.includes('player') || user.roles.includes('admin')))
    },
    // Players can update their own saved programs
    update: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false

      if (user.roles && user.roles.includes('admin')) return true

      if (user.roles && user.roles.includes('player')) {
        return {
          'player.user': {
            equals: user.id,
          },
        }
      }

      return false
    },
    // Players can delete their own saved programs
    delete: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false

      if (user.roles && user.roles.includes('admin')) return true

      if (user.roles && user.roles.includes('player')) {
        return {
          'player.user': {
            equals: user.id,
          },
        }
      }

      return false
    },
  },
  indexes: [
    {
      fields: ['player', 'college'],
      unique: true, // A player can only save a program once
    },
  ],
}
