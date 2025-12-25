# Clerk → PayloadCMS User Sync Implementation Summary

## What Was Built

A complete user authentication and synchronization system that integrates Clerk (authentication) with PayloadCMS (data storage) for the Girls Basketball Recruiting Platform.

## Files Created

### 1. Webhook Handler

**`app/(frontend)/api/webhooks/clerk/route.ts`**

- Receives webhook events from Clerk
- Handles `user.created`, `user.updated`, and `user.deleted` events
- Automatically syncs user data to PayloadCMS
- Validates webhook signatures for security
- Filters and validates roles before saving

### 2. Route Protection Middleware

**`proxy.ts`**

- Protects routes using Clerk authentication
- Public routes: `/`, `/sign-in`, `/sign-up`, `/api/webhooks/*`
- Protected routes: All other routes require auth
- Admin routes: `/admin/*` requires admin role
- Redirects non-admins away from admin panel

### 3. Documentation

- **`SETUP.md`** - Step-by-step setup guide
- **`.env.example`** - Environment variables template

## Files Modified

### 1. Users Collection

**`collections/Users.ts`**

- Added `firstName` and `lastName` fields
- Added indexed `clerkId` field for fast lookups
- Implemented role-based access control:
  - Admins: Full access
  - Users: Can read/update own data
  - Public: No access
- Added default role: `player`
- Improved field documentation

### 2. UserInfo Component

**`components/UserInfo.tsx`**

- Automatically syncs user on page load
- Displays user name and roles
- Shows PayloadCMS user ID
- Conditionally shows admin panel link for admins
- Improved UI with better styling

### 3. Environment Variables

**`.env`**

- Added `CLERK_WEBHOOK_SECRET` placeholder
- Added comments for configuration

## Architecture

```
┌─────────────┐
│  Clerk      │ (Authentication)
│  - Sign up  │
│  - Sign in  │
│  - User mgmt│
└──────┬──────┘
       │
       │ Webhooks (user.created/updated/deleted)
       ↓
┌──────────────────────────┐
│  Webhook Handler         │
│  /api/webhooks/clerk     │
│  - Verifies signature    │
│  - Extracts roles        │
│  - Syncs to PayloadCMS   │
└──────────┬───────────────┘
           │
           ↓
    ┌──────────────┐
    │  PayloadCMS  │ (Data Storage)
    │  - Users     │
    │  - Players   │
    │  - Media     │
    └──────────────┘
           ↑
           │ Direct queries
           │
    ┌──────────────┐
    │  Frontend    │
    │  - React     │
    │  - Next.js   │
    └──────────────┘
```

## User Flow

1. **User signs up** via Clerk UI
2. **Clerk webhook** fires `user.created` event
3. **Webhook handler** receives event, validates signature
4. **User created** in PayloadCMS with:
   - Email from Clerk
   - Clerk ID for linking
   - Role from Clerk public metadata
   - First/Last name from Clerk profile
5. **User logs in** to app
6. **User data** displayed from PayloadCMS

## Role System

### Three Roles

1. **`admin`** - Full system access
   - Access PayloadCMS admin panel (`/admin`)
   - Manage all users and players
   - Create/read/update/delete all data

2. **`player`** - Player-specific access
   - Create and manage own player profile
   - Read own user data
   - Limited PayloadCMS access

3. **`coach`** - Coach-specific access (future feature)
   - View player profiles
   - Limited data access

### Setting Roles

Roles are stored in Clerk's `publicMetadata`:

```json
{
  "roles": ["player"]
}
```

Can be set via:

- Clerk Dashboard → Users → [User] → Public metadata
- Clerk API programmatically

## Security Features

1. **Webhook Verification**
   - All webhooks verified using Svix signatures
   - Prevents unauthorized access

2. **HTTPS Only**
   - Webhooks must use HTTPS in production
   - ngrok for local development

3. **Role Validation**
   - Roles filtered and validated before saving
   - Only valid roles (`admin`, `player`, `coach`) accepted

4. **Access Control**
   - PayloadCMS collections have granular access rules
   - Users can only access their own data (unless admin)

5. **Middleware Protection**
   - Routes protected by Clerk proxy
   - Admin routes check for admin role

## Dependencies Added

- **`svix`** - Webhook verification library

## Environment Variables Required

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Database
POSTGRES_URL=postgresql://...

# PayloadCMS
PAYLOAD_SECRET=your_secret_here
```

## Setup Steps

1. **Install dependencies**: `pnpm install`
2. **Configure environment variables** in `.env`
3. **Set up Clerk webhooks**:
   - Development: Use ngrok
   - Production: Use production URL
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. **Get webhook secret** from Clerk Dashboard
5. **Run dev server**: `pnpm dev`
6. **Test signup** - user should sync to PayloadCMS
7. **Set admin role** in Clerk Dashboard for first user

## Testing Checklist

- [ ] User signup creates user in PayloadCMS
- [ ] User data syncs (email, name, roles)
- [ ] Roles update when changed in Clerk
- [ ] Admin can access `/admin`
- [ ] Non-admin redirected from `/admin`
- [ ] UserInfo component shows correct data
- [ ] Webhook logs show successful syncs

## Next Steps

1. ✅ **Run dev server** to regenerate PayloadCMS types
2. Test webhook integration with ngrok
3. Create first admin user
4. Build player profile features
5. Add coach functionality
6. Implement player search
7. Add video upload capabilities

## TypeScript Note

⚠️ **Important**: Run `pnpm dev` to regenerate PayloadCMS types. The newly added `firstName` and `lastName` fields need to be included in the generated `payload-types.ts` file.

Some `@ts-expect-error` comments have been added temporarily until types are regenerated.

## Troubleshooting

### Common Issues

1. **Webhook not triggering**
   - Check `CLERK_WEBHOOK_SECRET` is set
   - Verify ngrok URL matches Clerk webhook URL
   - Check Clerk Dashboard → Webhooks → Logs

2. **User not syncing**
   - Check terminal logs for errors
   - Verify database connection

3. **Admin access denied**
   - Verify roles in Clerk public metadata
   - Clear cookies and re-login
   - Check middleware configuration

4. **TypeScript errors**
   - Run `pnpm dev` to regenerate types
   - Types will update automatically

## Performance Considerations

- **Database indexing**: `clerkId` field is indexed for fast lookups
- **Webhook efficiency**: Minimal processing, quick responses
- **Caching**: Consider caching user data on frontend
- **Rate limiting**: Clerk handles rate limiting on their end

## Security Best Practices

✅ Implemented:

- Webhook signature verification
- HTTPS for webhooks (production)
- Role-based access control
- Input validation and sanitization
- Type-safe code with TypeScript

🔜 Recommended:

- Regular secret rotation
- Monitoring webhook logs
- Rate limiting on API routes
- SQL injection prevention (Payload handles this)

## Maintenance

### Regular Tasks

- [ ] Monitor webhook logs for failures
- [ ] Rotate `CLERK_WEBHOOK_SECRET` quarterly
- [ ] Review user roles and permissions
- [ ] Update dependencies monthly
- [ ] Backup database regularly

### When to Update

- When adding new user fields → Update webhook handler
- When adding new roles → Update Users collection options
- When changing auth flow → Update middleware
- When deploying → Update webhook URL in Clerk

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [PayloadCMS Documentation](https://payloadcms.com/docs)
- [Svix Webhook Verification](https://docs.svix.com/receiving/verifying-payloads/how)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

**Implementation Date**: December 2024
**Framework**: Next.js 16, React 19, PayloadCMS 3, Clerk
**Database**: PostgreSQL (Neon)
**Status**: ✅ Complete - Ready for testing
