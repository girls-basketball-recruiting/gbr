# Clerk to PayloadCMS User Sync

This document explains how user authentication and data sync works between Clerk and PayloadCMS in this application.

## Architecture Overview

```
┌──────────┐         ┌──────────────┐         ┌─────────────┐
│  Clerk   │ ──────> │  Webhooks    │ ──────> │  PayloadCMS │
│  (Auth)  │         │  /api/webhooks/clerk   │  (Users)    │
└──────────┘         └──────────────┘         └─────────────┘
     │                                               │
     │                                               │
     └──────────── Frontend App ────────────────────┘
```

### How it works:

1. **User signs up in Clerk** → Clerk creates the user account
2. **Clerk sends webhook** → Your app receives `user.created` event
3. **Webhook handler syncs** → Creates matching user in PayloadCMS with:
   - Email
   - Clerk ID (for linking)
   - Roles (from Clerk public metadata)
   - First/Last name
4. **User can access app** → Authentication via Clerk, data stored in PayloadCMS

## Setup Instructions

### 1. Environment Variables

Add to your `.env` file:

```bash
# Clerk (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
CLERK_SECRET_KEY=your_secret_here

# Clerk Webhook Secret (get this from Clerk Dashboard)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# PayloadCMS (already configured)
PAYLOAD_SECRET=your_payload_secret_here
POSTGRES_URL=your_postgres_url_here
```

### 2. Configure Clerk Webhooks

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Webhooks** in the sidebar
4. Click **Add Endpoint**
5. Add your webhook URL:
   - **Development**: Use [ngrok](https://ngrok.com) or similar:
     ```bash
     ngrok http 3000
     # Then use: https://your-ngrok-url.ngrok.io/api/webhooks/clerk
     ```
   - **Production**: `https://yourdomain.com/api/webhooks/clerk`

6. Subscribe to these events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`

7. Copy the **Signing Secret** and add it to `.env` as `CLERK_WEBHOOK_SECRET`

### 3. Set User Roles in Clerk

Roles are stored in Clerk's `publicMetadata` and synced to PayloadCMS.

#### Via Clerk Dashboard:

1. Go to **Users** in Clerk Dashboard
2. Click on a user
3. Scroll to **Public metadata**
4. Add:
   ```json
   {
     "roles": ["player"]
   }
   ```
   or for admins:
   ```json
   {
     "roles": ["admin"]
   }
   ```

#### Programmatically (in your app):

```typescript
import { clerkClient } from '@clerk/nextjs/server'

await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    roles: ['player'],
  },
})
```

### 4. Available Roles

- **`admin`**: Full access to PayloadCMS admin panel and all data
- **`player`**: Can create and manage their own player profile
- **`coach`**: Can view player profiles (future feature)

## Usage in Your App

### Get Current User's PayloadCMS Data

```typescript
import { getPayloadUserFromClerk } from '@/lib/syncClerkUser'

// In a Server Component or API route
const payloadUser = await getPayloadUserFromClerk()

if (payloadUser) {
  console.log(payloadUser.roles) // ['player']
  console.log(payloadUser.email)
}
```

### Ensure User is Synced (on first login)

```typescript
import { syncClerkUser } from '@/lib/syncClerkUser'

// This checks if user exists in PayloadCMS, creates if not
const payloadUser = await syncClerkUser()
```

### Check User Roles

```typescript
import { currentUser } from '@clerk/nextjs/server'

const user = await currentUser()
const roles = user?.publicMetadata?.roles as string[] | undefined

if (roles?.includes('admin')) {
  // User is an admin
}
```

## Route Protection

Routes are protected using Clerk proxy (`proxy.ts`):

### Public Routes (no auth required):

- `/` - Home page
- `/sign-in` - Sign in page
- `/register-(player|coach)` - Sign up page
- `/api/webhooks/*` - Webhook endpoints

### Protected Routes (auth required):

- All other routes require authentication

### Admin Routes (admin role required):

- `/admin/*` - PayloadCMS admin panel

## API Endpoints

### Webhook Handler

- **Path**: `app/(frontend)/api/webhooks/clerk/route.ts`
- **Method**: POST
- **Purpose**: Receives Clerk webhook events and syncs to PayloadCMS

### User API

- **Path**: `app/(payload)/api/user/route.ts`
- **Method**: GET
- **Purpose**: Get current PayloadCMS user data

## PayloadCMS Collections

### Users Collection

Located at: `collections/Users.ts`

**Fields:**

- `email` (required) - User's email
- `clerkId` (unique, indexed) - Links to Clerk user
- `roles` (array) - User roles: admin, player, coach
- `firstName` - From Clerk profile
- `lastName` - From Clerk profile
- `password` (hidden) - Required by Payload but not used

**Access Control:**

- Admins: Full access
- Users: Can read/update own data only
- Public: No access

### Players Collection

Located at: `collections/Players.ts`

**Access Control:**

- Admins: Full access
- Players: Can create/update their own profile
- Others: No access

## Testing the Integration

### 1. Test User Creation

1. Start your dev server: `pnpm dev`
2. Start ngrok (if testing webhooks locally): `ngrok http 3000`
3. Configure Clerk webhook with ngrok URL
4. Sign up a new user in your app
5. Check PayloadCMS admin panel - user should appear in Users collection
6. Check terminal logs for sync confirmation

### 2. Test Role Syncing

1. In Clerk Dashboard, add roles to a user's public metadata
2. Update the user (e.g., change their name)
3. Webhook triggers, roles sync to PayloadCMS
4. Verify in PayloadCMS admin panel

### 3. Test Admin Access

1. Set a user's role to `["admin"]` in Clerk
2. Login as that user
3. Navigate to `/admin`
4. Should have access to PayloadCMS admin panel

## Troubleshooting

### Webhook not triggering?

- Check Clerk Dashboard > Webhooks > Logs
- Verify webhook URL is correct
- Ensure `CLERK_WEBHOOK_SECRET` is set
- Check server logs for errors

### User not syncing?

- Check webhook logs in Clerk Dashboard
- Check server console for errors
- Manually sync using `syncClerkUser()` function
- Verify database connection

### Admin access not working?

- Verify roles in Clerk public metadata: `{"roles": ["admin"]}`
- Check user object in PayloadCMS has correct roles
- Clear cookies and re-login
- Check proxy.ts is configured correctly

### Development vs Production

**Development:**

- Use ngrok for webhook testing
- Webhook URL: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
- May need to update ngrok URL when restarting

**Production:**

- Webhook URL: `https://yourdomain.com/api/webhooks/clerk`
- Ensure environment variables are set in Vercel/hosting platform
- Test webhooks after deployment

## Security Considerations

1. **Webhook verification**: All webhooks are verified using Svix signatures
2. **HTTPS only**: Webhooks must be delivered over HTTPS in production
3. **Secret rotation**: Rotate `CLERK_WEBHOOK_SECRET` periodically
4. **Access control**: PayloadCMS collections have role-based access control
5. **Password security**: PayloadCMS passwords are randomly generated and never used

## Future Enhancements

- [ ] Add user profile pictures sync from Clerk
- [ ] Implement coach role functionality
- [ ] Add email notifications on user events
- [ ] Sync additional Clerk fields (phone, username, etc.)
- [ ] Add user deletion confirmation/soft delete
