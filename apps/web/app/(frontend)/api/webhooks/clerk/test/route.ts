import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { clerkClient } from '@clerk/nextjs/server'

/**
 * Test endpoint to debug webhook failures
 * Visit: http://localhost:3000/api/webhooks/clerk/test
 */
export async function GET() {
  console.log('🧪 Testing webhook handler...')

  // This is the actual payload from your failed webhook
  const testData = {
    id: 'user_36r4CMJoHDvuGMcq8dBTTivAJFV',
    email_addresses: [
      {
        email_address: 'coach1+clerk_test@gmail.com',
      },
    ],
    first_name: 'Gregg',
    last_name: 'Popovich',
    public_metadata: {} as Record<string, unknown>,
    unsafe_metadata: {
      userType: 'coach',
    },
  }

  try {
    // Get PayloadCMS instance
    console.log('1️⃣ Getting PayloadCMS instance...')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    console.log('✅ PayloadCMS instance obtained')

    // Determine role
    let role: 'player' | 'coach' | 'admin' = 'player'
    if (testData.public_metadata?.role) {
      role = testData.public_metadata.role as 'player' | 'coach' | 'admin'
    } else if (testData.unsafe_metadata?.userType) {
      const userType = testData.unsafe_metadata.userType
      if (userType === 'player' || userType === 'coach') {
        role = userType
      }
    }
    console.log(`2️⃣ Determined role: ${role}`)

    // Update Clerk user's publicMetadata with the role
    console.log('3️⃣ Updating Clerk publicMetadata...')
    try {
      const client = await clerkClient()
      await client.users.updateUserMetadata(testData.id, {
        publicMetadata: {
          role,
        },
      })
      console.log('✅ Updated Clerk publicMetadata')
    } catch (error) {
      console.error('❌ Error updating Clerk metadata:', error)
      throw new Error(
        `Clerk update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }

    const email = testData.email_addresses?.[0]?.email_address
    if (!email) {
      throw new Error('No email address found')
    }

    // Check if user already exists in PayloadCMS
    console.log('4️⃣ Checking if user exists in PayloadCMS...')
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        clerkId: {
          equals: testData.id,
        },
      },
    })

    if (existingUsers.docs.length > 0) {
      console.log('⚠️ User already exists in PayloadCMS, skipping creation')
      return NextResponse.json({
        success: true,
        message: 'User already exists in PayloadCMS',
        user: existingUsers.docs[0],
      })
    }

    // Create user in PayloadCMS
    console.log('5️⃣ Creating user in PayloadCMS...')
    try {
      const newUser = await payload.create({
        collection: 'users',
        data: {
          email,
          clerkId: testData.id,
          roles: [role],
          firstName: testData.first_name || undefined,
          lastName: testData.last_name || undefined,
          password:
            Math.random().toString(36).slice(-12) +
            Math.random().toString(36).slice(-12),
        },
      })
      console.log('✅ User created in PayloadCMS')

      return NextResponse.json({
        success: true,
        message: 'Test successful! User would be created.',
        role,
        user: newUser,
      })
    } catch (error) {
      console.error('❌ Error creating user in PayloadCMS:', error)
      throw new Error(
        `PayloadCMS creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  } catch (error) {
    console.error('❌ Test failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
