import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { cookies } from 'next/headers'

/**
 * This endpoint allows users to log into PayloadCMS admin using their Clerk session
 * Only users with the 'admin' role can access this
 */
export async function GET() {
  try {
    // Check if user is authenticated in Clerk
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return Response.redirect('/sign-in')
    }

    // Check if user has admin role
    const role = clerkUser.publicMetadata?.role as string | undefined
    if (role !== 'admin') {
      return new Response('Unauthorized - Admin role required', { status: 403 })
    }

    // Get PayloadCMS instance
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Find the user in PayloadCMS
    const users = await payload.find({
      collection: 'users',
      where: {
        clerkId: {
          equals: clerkUser.id,
        },
      },
    })

    if (users.docs.length === 0) {
      return new Response('User not found in PayloadCMS', { status: 404 })
    }

    const payloadUser = users.docs[0]

    if (!payloadUser) {
      return new Response('User not found in PayloadCMS', { status: 404 })
    }

    // Generate a login token for PayloadCMS
    const token = await payload.login({
      collection: 'users',
      data: {
        email: payloadUser.email,
        password: '', // Not needed when using loginWithToken
      },
      req: {
        user: payloadUser,
      } as any,
    })

    if (!token.token) {
      return new Response('Failed to generate login token', { status: 500 })
    }

    // Set the PayloadCMS cookie
    const cookieStore = await cookies()
    cookieStore.set(`payload-token`, token.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Redirect to admin panel
    return Response.redirect('/admin')
  } catch (error) {
    console.error('Error logging into PayloadCMS:', error)
    return new Response('Error logging in', { status: 500 })
  }
}
