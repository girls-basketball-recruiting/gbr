/**
 * Script to create a PayloadCMS admin user
 * Usage: tsx scripts/create-admin.ts
 *
 * Note: Requires .env.local to be present with PAYLOAD_SECRET, ADMIN_EMAIL, and ADMIN_PASSWORD
 */
async function createAdmin() {
  // Load env vars using dynamic import to ensure they load first
  const dotenv = await import('dotenv')
  const path = await import('path')
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

  // Verify PAYLOAD_SECRET is loaded
  if (!process.env.PAYLOAD_SECRET) {
    console.error('❌ PAYLOAD_SECRET not found in .env.local')
    process.exit(1)
  }

  // Now import payload after env vars are loaded
  const { getPayload } = await import('payload')
  const configModule = await import('../payload.config.js')
  const config = configModule.default

  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error('❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env file')
    process.exit(1)
  }

  console.log(`Creating admin user with email: ${email}`)

  try {
    const payload = await getPayload({ config })

    // Check if admin already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })

    if (existingUsers.docs.length > 0) {
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

    console.log('✅ Admin user created successfully!', admin)
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log('\nYou can now log in to /admin with these credentials.')
    console.log('\n⚠️ IMPORTANT: Change this password after first login!')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

createAdmin()
