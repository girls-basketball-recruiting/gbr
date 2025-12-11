# Deletion & Archival Strategy

## Overview
The application implements two types of deletions to handle data integrity and user experience:

1. **Hard Delete**: When a user is deleted from Clerk (admin action)
2. **Soft Delete**: When a user deletes their own profile

## Hard Delete (Clerk User Deletion)

**Webhook**: `/api/webhooks/clerk/user-deleted`

When a user is deleted from the Clerk dashboard, the webhook:
1. Finds the PayloadCMS user by `clerkId`
2. Deletes all associated player/coach profiles
3. Deletes all `SavedPlayers` records where user is the coach
4. Deletes all `CoachPlayerNotes` where user is the coach
5. Finally deletes the PayloadCMS user record

**Setup Required**:
1. Go to Clerk Dashboard → Webhooks
2. Create webhook for `user.deleted` event
3. Point to: `https://yourdomain.com/api/webhooks/clerk/user-deleted`
4. Use the `CLERK_WEBHOOK_SECRET` from your `.env`

## Soft Delete (Profile Deletion)

**Endpoint**: `POST /api/profile/player/[id]/delete`

When a player deletes their own profile:
- Sets `deletedAt` timestamp on the player record
- Record remains in database (for coach references)
- Profile is hidden from public player listings
- Saved player references remain intact for coaches

**Why Soft Delete?**
- Coaches may have saved players or notes about them
- Preserves historical data and relationships
- Allows coaches to see "This player was removed" instead of broken references

## Database Schema

### Added Fields

**Players Collection:**
```typescript
deletedAt: Date | null  // Soft delete timestamp
```

**Coaches Collection:**
```typescript
deletedAt: Date | null  // Soft delete timestamp
```

## API Behavior

### Filtering Deleted Records

**Players Listing** (`/players`):
```typescript
where: {
  deletedAt: { exists: false }  // Excludes soft-deleted players
}
```

### Including Deleted Records

For coach's saved players (to show archived status):
```typescript
// Don't filter by deletedAt
// Show all saved players, even archived ones
```

## UI Behavior

### Archived Player Cards

When a player is archived (`deletedAt` is set):
- Card shows orange warning banner: "⚠️ This player profile has been removed"
- Card has reduced opacity (60%)
- Orange border indicator
- "View Profile" button disabled → "Profile Unavailable"
- Save/action buttons still work (coaches can keep saved players)

### Example:
```tsx
{isArchived && (
  <div className='bg-orange-600/20 border border-orange-600/50'>
    ⚠️ This player profile has been removed
  </div>
)}
```

## Future Enhancements

1. **Coach Soft Delete**: Add same endpoint for coaches
2. **Restore Functionality**: Allow admins to restore soft-deleted profiles
3. **Cascade Soft Deletes**: When coach is deleted, soft-delete their prospects
4. **Scheduled Cleanup**: Permanently delete records after X days
5. **Admin Dashboard**: View and manage archived records

## Testing

### Test Hard Delete:
1. Create test user in Clerk
2. Create player/coach profile
3. Delete user from Clerk dashboard
4. Verify webhook deletes all PayloadCMS records

### Test Soft Delete:
1. Login as player
2. Delete your profile
3. Verify `deletedAt` is set
4. Verify profile hidden from listings
5. Verify saved player references still show (with archived UI)

## Maintenance

### Regenerate Types After Schema Changes:
```bash
pnpm payload:generate-types
```

### View Archived Records (Admin):
Access PayloadCMS admin at `/admin` to see all records including archived ones.
