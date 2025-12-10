import 'dotenv/config'

import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Script to create a PayloadCMS admin user
 * Usage: tsx scripts/create-admin.ts
 */
async function createAdmin() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'

  console.log(`Creating admin user with email: ${email}`)

  try {
    // Check if admin already exists
    const existingAdmins = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })

    if (existingAdmins.docs.length > 0) {
      console.log('❌ Admin user already exists!')
      console.log(
        'To reset password, delete the user and run this script again.',
      )
      process.exit(1)
    }

    // Create the admin user
    const admin = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        roles: ['admin'],
        firstName: 'Admin',
        lastName: 'User',
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log('\nYou can now log in to /admin with these credentials.')
    console.log('\n⚠️  IMPORTANT: Change this password after first login!')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

createAdmin()
