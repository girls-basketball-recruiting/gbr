import { put, del, list } from '@vercel/blob'

/**
 * Uploads a profile image to Vercel Blob storage.
 * If an old image URL exists, it will be deleted first to ensure only one image per user.
 *
 * @param file - The file to upload
 * @param userId - The user ID (used for organizing blobs)
 * @param userType - The user type ("player" or "coach")
 * @param oldImageUrl - The existing image URL to delete (if any)
 * @returns The new blob URL
 */
export async function uploadProfileImage(
  file: File,
  userId: string | number,
  userType: 'player' | 'coach',
  oldImageUrl?: string | null
): Promise<string> {
  // Delete old image if it exists
  if (oldImageUrl) {
    await deleteProfileImage(oldImageUrl)
  }

  // Generate a unique filename with timestamp to prevent caching issues
  const timestamp = Date.now()
  const extension = file.name.split('.').pop() || 'jpg'
  const dir = userType === 'player' ? 'players' : 'coaches'
  const filename = `${dir}/${userId}/profile-${timestamp}.${extension}`

  // Upload to Vercel Blob
  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: false, // We're already adding timestamp
  })

  return blob.url
}

/**
 * Deletes a profile image from Vercel Blob storage.
 *
 * @param imageUrl - The blob URL to delete
 */
export async function deleteProfileImage(imageUrl: string): Promise<void> {
  try {
    // Only delete if it's a Vercel Blob URL
    if (imageUrl.includes('blob.vercel-storage.com') || imageUrl.includes('public.blob.vercel-storage.com')) {
      await del(imageUrl)
      console.log(`Deleted blob: ${imageUrl}`)
    }
  } catch (error) {
    // Log but don't throw - we don't want deletion failures to block the main operation
    console.error('Error deleting blob:', error)
  }
}

/**
 * Deletes all profile images for a specific user.
 * Called when a user is deleted to clean up all their blobs.
 *
 * @param userId - The user ID
 */
export async function deleteAllUserProfileImages(userId: string | number): Promise<void> {
  try {
    const prefix = `players/${userId}/`

    // List all blobs with this prefix
    const { blobs } = await list({ prefix })

    // Delete each blob
    const deletePromises = blobs.map(blob => del(blob.url))
    await Promise.all(deletePromises)

    console.log(`Deleted ${blobs.length} blob(s) for user ${userId}`)
  } catch (error) {
    console.error(`Error deleting blobs for user ${userId}:`, error)
  }
}
