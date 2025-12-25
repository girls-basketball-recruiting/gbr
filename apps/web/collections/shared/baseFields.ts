import type { Field } from 'payload'

export const baseUserFields: Field[] = [
  {
    name: 'firstName',
    type: 'text',
    required: true,
    admin: {
      description: 'First name',
    },
  },
  {
    name: 'lastName',
    type: 'text',
    required: true,
    admin: {
      description: 'Last name',
    },
  },
  // Note: email is automatically added by auth: true in Users collection
  // Do not add email here to avoid duplicates
]