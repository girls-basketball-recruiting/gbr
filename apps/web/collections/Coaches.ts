import type { CollectionConfig } from 'payload'

export const Coaches: CollectionConfig = {
  slug: 'coaches',
  admin: {
    useAsTitle: 'name',
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
            {
              name: 'name',
              type: 'text',
              required: true,
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
