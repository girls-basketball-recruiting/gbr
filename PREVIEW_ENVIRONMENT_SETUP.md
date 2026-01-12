# Preview Environment Setup Guide

This guide walks you through setting up a preview/staging environment for the GBR platform. The preview environment allows you to test changes before deploying to production.

---

## Overview

A complete preview environment requires:

1. **Vercel Project** - Separate deployment environment
2. **Database** - Separate PostgreSQL database
3. **Clerk** - Separate development instance (or same instance with test users)
4. **Stripe** - Test mode (can use same account)
5. **Vercel Blob** - Separate storage (or shared with production)

---

## Step 1: Create a Vercel Preview Project

### Option A: Separate Vercel Project (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import the same Git repository
4. Name it `gbr-preview` (or similar)
5. Set the Git branch to `preview`
6. Configure environment variables (see Step 5)
7. Deploy

### Option B: Use Vercel Preview Deployments

If you prefer to use Vercel's built-in preview deployments:

1. Go to your existing project settings
2. Navigate to "Git" settings
3. Enable "Preview Deployments" for the `preview` branch
4. Configure environment variables per-branch:
   - Go to Settings > Environment Variables
   - Add preview-specific variables with "Preview" environment selected

---

## Step 2: Create a Preview Database

### Using Vercel Postgres

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Storage" tab
3. Click "Create Database" > "Postgres"
4. Name it `gbr-preview-db`
5. Select region (same as your deployment)
6. Copy the connection strings for environment variables

### Environment Variables from Vercel Postgres

After creating the database, you'll get these values:

```bash
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...
```

---

## Step 3: Set Up Clerk (Authentication)

### Option A: Create a Separate Clerk Application (Recommended)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click "Create application"
3. Name it "GBR Preview"
4. Enable sign-in methods:
   - Email + Password
   - Google OAuth
5. Go to "API Keys" and copy:
   - Publishable Key (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
   - Secret Key (`CLERK_SECRET_KEY`)
6. Set up Webhook:
   - Go to "Webhooks" > "Add Endpoint"
   - URL: `https://your-preview-domain.vercel.app/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy the Signing Secret (`CLERK_WEBHOOK_SECRET`)

### Option B: Use Same Clerk App with Test Users

You can use the same Clerk application but:
- Use separate test email accounts
- The database will be separate, so users won't overlap

---

## Step 4: Set Up Stripe (Payments)

Stripe test mode is shared across environments, so you can use the same account.

### Get Test Mode Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle "Test mode" (top right)
3. Go to Developers > API Keys
4. Copy:
   - Publishable key (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
   - Secret key (`STRIPE_SECRET_KEY`)

### Set Up Webhook for Preview

1. Go to Developers > Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-preview-domain.vercel.app/api/webhooks/stripe`
4. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
5. Copy the Signing Secret (`STRIPE_WEBHOOK_SECRET`)

### Price IDs (Test Mode)

You may already have test products/prices. If not:

1. Go to Products (in test mode)
2. Create "Player Pro" - $39/year
3. Create "Coach Pro" - $99/year
4. Copy the Price IDs for each

---

## Step 5: Environment Variables

Create/update your environment variables in Vercel for the preview environment:

### Required Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Database (Vercel Postgres)
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
POSTGRES_USER=default
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=verceldb

# PayloadCMS Secret (generate a new one for preview)
PAYLOAD_SECRET=<generate-32+-random-characters>

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PLAYER_PRO_YEARLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_COACH_PRO_YEARLY_PRICE_ID=price_...

# App URL (Preview domain)
NEXT_PUBLIC_APP_URL=https://your-preview-domain.vercel.app
```

### Generating PAYLOAD_SECRET

Generate a secure random string for PayloadCMS:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using openssl
openssl rand -hex 32
```

---

## Step 6: Deploy and Run Migrations

### Initial Deployment

1. Push to the `preview` branch:
   ```bash
   git checkout preview
   git merge main  # or cherry-pick specific commits
   git push origin preview
   ```

2. Vercel will automatically deploy

### Run Database Migrations

After first deployment, you need to run migrations to create the database schema:

**Option A: Using Vercel Functions (Automatic)**

PayloadCMS automatically runs migrations on startup. The first deployment should apply all migrations.

**Option B: Manual via CLI**

If you need to run migrations manually:

```bash
# Set preview environment variables locally
export DATABASE_URL="postgresql://..."
export PAYLOAD_SECRET="..."

# Run migrations
pnpm --filter web db:migrate
```

---

## Step 7: Verify the Setup

### 1. Check Deployment Status

- Go to Vercel Dashboard > Your preview project
- Verify deployment is successful (green check)

### 2. Test Authentication

1. Visit your preview URL
2. Try to register as a player
3. Verify Clerk signup works
4. Check Clerk webhook received (Clerk Dashboard > Webhooks)

### 3. Test Payment Flow

1. Register a new user
2. Go to payment page
3. Use Stripe test card: `4242 4242 4242 4242`
4. Verify subscription is created
5. Check Stripe webhook received (Stripe Dashboard > Webhooks)

### 4. Test Operations Panel

1. Visit the operations panel URL (see internal documentation)
2. Create an admin user (first user becomes admin)
3. Verify you can access collections

---

## Local Development with Preview Database

To develop locally against the preview database:

1. Copy preview environment variables to `apps/web/.env.local`
2. Run the development server:
   ```bash
   pnpm dev
   ```

**Warning**: This will use the preview database, so any changes you make will affect the preview environment.

---

## Keeping Preview in Sync

### Regular Syncs

To keep preview up-to-date with main:

```bash
git checkout preview
git merge main
git push origin preview
```

### Database Migrations

When schema changes are made:

1. Deploy to preview first
2. Migrations run automatically on deployment
3. Test thoroughly
4. Then deploy to production

---

## Troubleshooting

### Deployment Failed

1. Check Vercel build logs
2. Verify all environment variables are set
3. Check for TypeScript errors

### Webhook Not Working

1. Verify webhook URL is correct
2. Check webhook secret matches
3. View webhook logs in Clerk/Stripe dashboard

### Database Connection Failed

1. Verify `DATABASE_URL` is correct
2. Check database is in the same region
3. Try `POSTGRES_URL_NON_POOLING` for migrations

### Auth Issues

1. Clear browser cookies
2. Verify Clerk keys match the correct application
3. Check webhook is receiving events

---

## Environment Checklist

Before considering the preview environment complete, verify:

- [ ] Vercel project created and deployed
- [ ] Preview database created and connected
- [ ] Clerk application configured with webhook
- [ ] Stripe webhook configured for preview domain
- [ ] All environment variables set in Vercel
- [ ] Database migrations ran successfully
- [ ] User registration works (Player + Coach)
- [ ] Payment flow works with test cards
- [ ] Operations panel accessible
- [ ] File uploads work (profile images)
- [ ] Webhooks receiving events (Clerk + Stripe)

---

## Quick Reference: Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0025 0000 3155 | Requires 3DS |

Use any future expiry date and any CVC.
