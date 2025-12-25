import type { CollectionConfig } from 'payload'

export const Invitations: CollectionConfig = {
  slug: 'invitations',
  admin: {
    useAsTitle: 'token',
    defaultColumns: ['token', 'role', 'redeemedAt', 'expiresAt', 'createdAt'],
    description: 'Manage invitation tokens for first-year-free promotions',
  },
  fields: [
    {
      name: 'token',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Unique invitation token (auto-generated UUID)',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Player', value: 'player' },
        { label: 'Coach', value: 'coach' },
      ],
      admin: {
        description: 'User role this invitation is for',
      },
    },
    {
      name: 'promoCode',
      type: 'text',
      required: true,
      defaultValue: 'FIRST_YEAR_FREE',
      admin: {
        description: 'Stripe coupon code to apply (e.g., FIRST_YEAR_FREE)',
      },
    },
    {
      name: 'invitedEmail',
      type: 'email',
      admin: {
        description: 'Optional: Lock invitation to specific email address',
      },
    },
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Admin who created this invitation',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'Optional: Invitation expiry date (defaults to 14 days if not set)',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'redeemedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'When the invitation was redeemed (null if unused)',
        position: 'sidebar',
      },
    },
    {
      name: 'redeemedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
        description: 'User who redeemed this invitation',
        position: 'sidebar',
      },
    },
    {
      name: 'invitationUrl',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Full invitation URL to share',
        components: {
          Field: '/components/payload/InvitationUrlField',
        },
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (!data) return data

        // Auto-generate token on create
        if (operation === 'create' && !data.token) {
          data.token = crypto.randomUUID()
        }

        // Set default expiry to 14 days if not provided
        if (operation === 'create' && !data.expiresAt) {
          const expiryDate = new Date()
          expiryDate.setDate(expiryDate.getDate() + 14)
          data.expiresAt = expiryDate.toISOString()
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        // Build invitation URL after creation
        if (operation === 'create') {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          const role = doc.role === 'player' ? 'player' : 'coach'
          doc.invitationUrl = `${baseUrl}/register-${role}?invite=${doc.token}`
        }
        return doc
      },
    ],
  },
  access: {
    // Only admins can manage invitations
    read: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(user.roles && user.roles.includes('admin'))
    },
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
  },
}
