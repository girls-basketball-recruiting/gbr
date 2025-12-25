import type { CollectionConfig } from 'payload'
import { ACTIVE_COACH_POSITIONS } from '@/lib/zod/CoachPositions'
import { baseUserFields } from './shared/baseFields'

export const Coaches: CollectionConfig = {
  slug: 'coaches',
  admin: {
    useAsTitle: 'user',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profile',
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
            ...baseUserFields,
            {
              name: 'email',
              type: 'email',
              required: true,
              admin: {
                description: 'Email address (denormalized from user for easier querying)',
              },
            },
            {
              name: 'collegeId',
              type: 'number',
              required: true,
              admin: {
                description: 'College ID from database',
              },
            },
            {
              name: 'collegeName',
              type: 'text',
              required: true,
              admin: {
                description: 'College name (denormalized for quick display)',
              },
            },
            {
              name: 'jobTitle',
              type: 'select',
              options: ACTIVE_COACH_POSITIONS.map(pos => ({
                label: pos.label,
                value: pos.value,
              })),
              admin: {
                description: 'Your coaching position',
              },
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
              name: 'profileImageUrl',
              type: 'text',
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
        },
        {
          label: 'Saved Players',
          fields: [
            {
              name: 'savedPlayersTab',
              type: 'ui',
              admin: {
                components: {
                  Field: '/components/payload/SavedPlayersTab',
                },
              },
            },
          ],
        },
        {
          label: 'Player Notes',
          fields: [
            {
              name: 'playerNotesTab',
              type: 'ui',
              admin: {
                components: {
                  Field: '/components/payload/PlayerNotesTab',
                },
              },
            },
          ],
        },
        {
          label: 'Prospects',
          fields: [
            {
              name: 'prospectsTab',
              type: 'ui',
              admin: {
                components: {
                  Field: '/components/payload/ProspectsTab',
                },
              },
            },
          ],
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
