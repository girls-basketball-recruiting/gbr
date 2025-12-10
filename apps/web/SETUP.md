# Setup Guide - Girls Basketball Recruiting Platform

This guide will help you set up the application with Clerk authentication and PayloadCMS.

## Prerequisites

- Node.js 20+
- pnpm 10+
- A Neon or Vercel Postgres database
- A Clerk account (free tier works)

## Step 1: Clone and Install

```bash
git clone <your-repo-url>
cd gbr
pnpm install
```

## Step 2: Database Setup

### Option A: Neon (Recommended)

1. Sign up at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Create `.env` in `apps/web/` and add:

```bash
POSTGRES_URL=your_connection_string_here
```

### Option B: Vercel Postgres

1. Create a Vercel project
2. Add Vercel Postgres from the Storage tab
3. Copy environment variables to `.env`

## Step 3: Clerk Setup

1. Sign up at [Clerk](https://clerk.com)
2. Create a new application
3. Go to **API Keys** and copy:
   - Publishable Key
   - Secret Key
4. Add to `.env`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
```

## Step 4: PayloadCMS Setup

1. Generate a secure secret (min 32 characters):

```bash
openssl rand -base64 32
```

2. Add to `.env`:

```bash
PAYLOAD_SECRET=your_generated_secret
```

## Step 5: Configure Clerk Webhooks

### Development (using ngrok)

1. Install ngrok: `brew install ngrok` or download from [ngrok.com](https://ngrok.com)
2. Start your dev server: `pnpm dev`
3. In another terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### Configure in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks** → **Add Endpoint**
3. Set endpoint URL:
   - Dev: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - Prod: `https://yourdomain.com/api/webhooks/clerk`
4. Subscribe to events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Click **Create**
6. Copy the **Signing Secret** (starts with `whsec_`)
7. Add to `.env`:
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_your_secret
   ```

## Step 6: Run the Application

```bash
cd apps/web
pnpm dev
```

Visit http://localhost:3000

## Step 7: Create Your First Admin User

1. Sign up in the app
2. Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Users**
3. Click on your user
4. Scroll to **Public metadata**
5. Click **Edit**
6. Add:
   ```json
   {
     "roles": ["admin"]
   }
   ```
7. Click **Save**
8. Webhook will automatically sync to PayloadCMS
9. You can now access `/admin` with admin privileges

## Step 8: Test the Integration

1. **Create a test user**: Sign up with a new email
2. **Check sync**: User should appear in PayloadCMS admin → Users
3. **Check roles**: Default role should be "player"
4. **Test admin access**: Login with admin user, visit `/admin`

## Project Structure

```
apps/web/
├── app/
│   ├── (frontend)/          # Public-facing app
│   │   ├── api/
│   │   │   └── webhooks/    # Clerk webhooks
│   │   ├── layout.tsx       # Clerk provider
│   │   └── page.tsx         # Home page
│   └── (payload)/           # PayloadCMS admin
│       └── admin/
├── collections/             # PayloadCMS collections
│   ├── Users.ts            # User collection with roles
│   └── Players.ts          # Player profiles
├── lib/
│   ├── syncClerkUser.ts    # User sync utilities
│   └── getPayloadUser.ts   # Get PayloadCMS user
├── proxy.ts           # Route protection
└── payload.config.ts       # PayloadCMS config
```

## Available Routes

### Public Routes

- `/` - Home page
- `/sign-in` - Clerk sign in
- `/sign-up` - Clerk sign up

### Protected Routes

- All routes except public ones require authentication

### Admin Routes

- `/admin` - PayloadCMS admin panel (admin role required)

## User Roles

The system supports three roles:

1. **Admin** (`admin`)
   - Full access to PayloadCMS admin panel
   - Can manage all users and players
   - Can delete data

2. **Player** (`player`)
   - Can create and manage their own player profile
   - Limited access to PayloadCMS features

3. **Coach** (`coach`)
   - Can view player profiles (future feature)
   - Limited access

### Setting Roles

Roles are managed in Clerk's public metadata:

```typescript
// Via Clerk API
import { clerkClient } from '@clerk/nextjs/server'

await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    roles: ['player'], // or ['admin'], ['coach']
  },
})
```

Or manually in Clerk Dashboard → Users → [User] → Public metadata

## Development Workflow

### Running Locally

```bash
# Terminal 1: Dev server
pnpm dev

# Terminal 2: ngrok (for webhooks)
ngrok http 3000
```

### Testing Webhooks

1. Sign up a new user
2. Check terminal logs for sync confirmation
3. Check PayloadCMS admin for new user
4. Check Clerk Dashboard → Webhooks → Logs

### Common Tasks

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build for production
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Troubleshooting

### Webhook not working?

- Check `.env` has `CLERK_WEBHOOK_SECRET`
- Verify ngrok is running (dev only)
- Check Clerk Dashboard → Webhooks → Logs for errors
- Ensure webhook URL matches ngrok URL

### User not syncing?

- Check terminal logs for errors
- Verify database connection
- Check PayloadCMS admin → Users
- Try signing out and back in

### Can't access /admin?

- Verify user has `admin` role in Clerk metadata
- Check proxy.ts is protecting the route
- Clear cookies and re-login
- Check browser console for errors

### Database connection issues?

- Verify `POSTGRES_URL` in `.env`
- Check database is running
- Ensure SSL mode is correct for your provider

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.example`
4. Deploy
5. Configure Clerk webhook with production URL
6. Test signup flow

### Environment Variables Checklist

Make sure all these are set in Vercel:

- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- ✅ `CLERK_SECRET_KEY`
- ✅ `CLERK_WEBHOOK_SECRET`
- ✅ `POSTGRES_URL`
- ✅ `PAYLOAD_SECRET`

## Next Steps

1. Review [CLERK_PAYLOAD_SYNC.md](./CLERK_PAYLOAD_SYNC.md) for detailed sync documentation
2. Customize the Players collection in `collections/Players.ts`
3. Build out your player profile features
4. Add more collections as needed
5. Customize the frontend UI

## Getting Help

- [Clerk Documentation](https://clerk.com/docs)
- [PayloadCMS Documentation](https://payloadcms.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- Project Issues: [Create an issue](../../issues)

## Security Notes

- Never commit `.env` to git
- Rotate secrets regularly
- Use strong passwords for database
- Enable 2FA on Clerk account
- Monitor webhook logs for suspicious activity
