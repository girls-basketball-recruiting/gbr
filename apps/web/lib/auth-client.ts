'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

/**
 * Client-side auth utilities
 */

/**
 * Hook for programmatic sign-out
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * export function MyComponent() {
 *   const { signOut } = useSignOut()
 *
 *   const handleSignOut = async () => {
 *     await signOut()
 *   }
 *
 *   return <button onClick={handleSignOut}>Sign Out</button>
 * }
 * ```
 */
export function useSignOut() {
  const { signOut: clerkSignOut } = useClerk()
  const router = useRouter()

  const signOut = async (redirectUrl = '/') => {
    try {
      await clerkSignOut()
      router.push(redirectUrl)
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
      // Fallback to API route
      window.location.href = '/api/auth/signout'
    }
  }

  return { signOut }
}

/**
 * Navigate to sign out (can be used in event handlers)
 *
 * @example
 * ```tsx
 * <button onClick={navigateToSignOut}>Sign Out</button>
 * ```
 */
export const navigateToSignOut = () => {
  window.location.href = '/api/auth/signout'
}
