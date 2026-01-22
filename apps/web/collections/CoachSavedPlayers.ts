import type { CollectionConfig } from 'payload'

export const CoachSavedPlayers: CollectionConfig = {
  slug: 'coach-saved-players',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['coach', 'player', 'savedAt'],
    hidden: true, // Hidden from sidebar - accessed via Coach tabs
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Add to coach's boardOrder when a player is saved
        if (operation === 'create' && req.payload) {
          const coachId = typeof doc.coach === 'number' ? doc.coach : doc.coach?.id
          const playerId = typeof doc.player === 'number' ? doc.player : doc.player?.id
          if (!coachId || !playerId) return doc

          const coach = await req.payload.findByID({
            collection: 'coaches',
            id: coachId,
          })

          const currentOrder = (coach.boardOrder as Array<{ type: string; id: number }>) || []
          // Only add if not already in the list
          const alreadyExists = currentOrder.some(
            (item) => item.type === 'player' && item.id === playerId
          )
          if (!alreadyExists) {
            await req.payload.update({
              collection: 'coaches',
              id: coachId,
              data: {
                boardOrder: [...currentOrder, { type: 'player', id: playerId }],
              },
            })
          }
        }
        return doc
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        // Remove from coach's boardOrder when a player is unsaved
        if (req.payload) {
          const coachId = typeof doc.coach === 'number' ? doc.coach : doc.coach?.id
          const playerId = typeof doc.player === 'number' ? doc.player : doc.player?.id
          if (!coachId || !playerId) return doc

          const coach = await req.payload.findByID({
            collection: 'coaches',
            id: coachId,
          })

          const currentOrder = (coach.boardOrder as Array<{ type: string; id: number }>) || []
          const newOrder = currentOrder.filter(
            (item) => !(item.type === 'player' && item.id === playerId)
          )

          if (newOrder.length !== currentOrder.length) {
            await req.payload.update({
              collection: 'coaches',
              id: coachId,
              data: {
                boardOrder: newOrder,
              },
            })
          }
        }
        return doc
      },
    ],
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
