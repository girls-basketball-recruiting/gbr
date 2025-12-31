# Stripe Webhook Setup Guide

This guide will help you set up Stripe webhooks to properly sync subscription data to PayloadCMS and Clerk.

## Current Issue

Users are completing payment in Stripe but their Clerk and PayloadCMS records aren't being updated with subscription details (stripeCustomerId, stripeSubscriptionId, etc.).

## Root Cause

The webhook endpoint exists at `/api/webhooks/stripe` but Stripe doesn't know about it yet. You need to register this endpoint in your Stripe Dashboard.

## Setup Steps

### 1. Register Webhook in Stripe Dashboard

#### For Development (Local Testing)

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login to Stripe: `stripe login`
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```
4. This will output a webhook signing secret like `whsec_...`
5. Add it to your `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

#### For Production (Deployed App)

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add it to your Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### 2. Verify Environment Variables

Make sure these are set in your `.env.local` (dev) and Vercel (production):

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_or_live_...
STRIPE_SECRET_KEY=sk_test_or_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PLAYER_PRO_YEARLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_COACH_PRO_YEARLY_PRICE_ID=price_...
STRIPE_FIRST_YEAR_FREE_PROMO_CODE=promo_...
```

### 3. Test the Webhook

#### Using Stripe CLI (Development)

1. Trigger a test event:
   ```bash
   stripe trigger checkout.session.completed
   ```

2. Check your terminal logs for:
   - `🔄 Processing checkout.session.completed for user ...`
   - `✅ Successfully updated user ... with subscription details`

3. If you see errors, check the webhook logs in Stripe Dashboard

#### Using Stripe Dashboard (Production)

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click on your webhook endpoint
3. Go to "Send test webhook"
4. Select `checkout.session.completed`
5. Click "Send test webhook"
6. Check the response and logs

### 4. Common Issues

#### Webhook Returns 500 Error

**Possible causes:**
1. `STRIPE_WEBHOOK_SECRET` not set or incorrect
2. User not found in PayloadCMS database
3. Clerk user ID mismatch

**How to debug:**
1. Check webhook logs in Stripe Dashboard > Developers > Webhooks > [Your endpoint]
2. Check your app logs (Vercel logs or local terminal)
3. Look for error messages starting with `❌`

#### User Not Being Updated

**Possible causes:**
1. Clerk user was created but PayloadCMS user wasn't (Clerk webhook might have failed)
2. Metadata mismatch - Stripe session has wrong clerkUserId

**How to debug:**
1. Check PayloadCMS admin panel - does the user exist?
2. Check Clerk Dashboard - verify the user's ID
3. Add logging to the webhook handler to see what's happening

#### Subscription Created But Properties Not Set

**Check these:**
1. Is the webhook being called? (Check Stripe Dashboard webhook logs)
2. Is it returning 200? (Should see success in Stripe logs)
3. Are there any errors in your app logs?
4. Does the PayloadCMS user exist with the correct clerkId?

### 5. Verify It's Working

After a successful payment:

1. **Check Stripe Dashboard:**
   - Go to Customers > [Your test customer]
   - Should see an active subscription
   - Metadata should include `clerkUserId`

2. **Check PayloadCMS:**
   - Go to PayloadCMS admin (`/admin`)
   - Find the user
   - Should see:
     - `stripeCustomerId`: starts with `cus_`
     - `stripeSubscriptionId`: starts with `sub_`
     - `stripePriceId`: starts with `price_`
     - `stripeCurrentPeriodEnd`: future date

3. **Check Webhook Logs:**
   - Stripe Dashboard > Developers > Webhooks > [Your endpoint]
   - Should see successful events with 200 responses

## Next Steps

Once webhooks are working, users should be redirected properly after payment:
1. Payment completes → Stripe calls your webhook
2. Webhook updates PayloadCMS user with subscription data
3. User is redirected to `/checkout/return`
4. Return page verifies payment and redirects to onboarding or dashboard

## Troubleshooting Commands

```bash
# Test local webhook with Stripe CLI
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed

# Check webhook logs
stripe logs tail

# Verify webhook secret
echo $STRIPE_WEBHOOK_SECRET
```

## Additional Notes

- Webhooks are called by Stripe even if the user closes the browser
- They're the source of truth for subscription status
- Always validate the webhook signature (already done in the code)
- Test in development before deploying to production
