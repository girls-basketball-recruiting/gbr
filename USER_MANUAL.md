# GBR Platform - Owner's Manual

A complete guide to managing and operating the Girls Basketball Recruiting platform.

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Systems You'll Access](#systems-youll-access)
3. [User Journeys](#user-journeys)
4. [Admin Panel Guide](#admin-panel-guide)
5. [Managing Subscriptions](#managing-subscriptions)
6. [Common Tasks](#common-tasks)
7. [Troubleshooting](#troubleshooting)

---

## Platform Overview

GBR connects high school girls basketball players with college coaches through a subscription-based platform.

### What the Platform Does

| For Players | For Coaches |
|-------------|-------------|
| Create athletic profiles with stats, videos, and academic info | Search and filter player profiles |
| Browse 1,700+ college programs | Save players to recruiting boards |
| Save favorite programs with notes | Track contact history and evaluations |
| Mark tournament attendance | Add "prospects" (unregistered players) |
| Connect with coaches | Import prospects via CSV |

### Revenue Model

- **Player Pro**: $39/year
- **Coach Pro**: $99/year
- First-year-free promotional codes available

---

## Systems You'll Access

### 1. The GBR Website

**URL**: `https://girlsbasketballrecruiting.com`

This is what users see. You can browse it like any user to see how it works.

### 2. Admin Panel (PayloadCMS)

**URL**: `https://girlsbasketballrecruiting.com/admin`

This is your content management system where you can:
- View all users, players, and coaches
- Manage the college database
- Manage tournament listings
- Create promotional invitation codes
- View and moderate content

**Login**: Use your admin account credentials (separate from regular user accounts)

### 3. Clerk Dashboard

**URL**: `https://dashboard.clerk.com`

This manages user authentication (sign-ups, logins, passwords). Use this to:
- View all registered users
- Reset passwords for users
- See sign-up statistics
- Manage OAuth settings (Google login)

### 4. Stripe Dashboard

**URL**: `https://dashboard.stripe.com`

This manages payments and subscriptions. Use this to:
- View subscription revenue
- Issue refunds
- Create promotional coupon codes
- View payment history
- Handle billing disputes

### 5. Vercel Dashboard

**URL**: `https://vercel.com/dashboard`

This hosts and deploys the website. It is mainly a developer tool. Site analytics are also available here.

---

## User Journeys

### Player Sign-Up Flow

```
1. Player visits the site
2. Clicks "Register as Player"
3. Creates account (email/password or Google)
4. Redirected to payment page
5. Completes $39 annual subscription
6. Redirected to 4-step onboarding form:
   - Step 1: Bio & Contact Info
   - Step 2: Athletic Stats & Position
   - Step 3: Academic Info & GPA
   - Step 4: College Preferences
7. Profile complete - enters dashboard
```

### Coach Sign-Up Flow

```
1. Coach visits the site
2. Clicks "Register as Coach"
3. Creates account (email/password or Google)
4. Redirected to payment page
5. Completes $99 annual subscription
6. Fills out coach profile:
   - Name and contact info
   - College affiliation (select from database)
   - Coaching position (Head Coach, Assistant, etc.)
   - Bio
7. Profile complete - enters dashboard
```

### What Players Can Do After Signing Up

1. **View/Edit Profile**: Update their athletic stats, videos, and contact info
2. **Browse Programs**: Search and filter 1,700+ college basketball programs
3. **Save Programs**: Save favorites with personal notes
4. **View Tournaments**: See upcoming AAU tournaments
5. **Mark Attendance**: Indicate which tournaments they'll attend

### What Coaches Can Do After Signing Up

1. **Search Players**: Use filters to find players by:
   - Graduation year (Class of 2025, 2026, etc.)
   - Position (Point Guard, Center, etc.)
   - Location (State, City)
   - GPA range
   - Height range

2. **Save Players**: Add players to their recruiting board

3. **Take Notes**: For each player, coaches can:
   - Write evaluation notes
   - Log contact history (emails, calls, visits)
   - Set interest level (High/Medium/Low/Watching)
   - Add custom tags
   - Set follow-up reminders

4. **Track Prospects**: Add unregistered players manually:
   - Enter basic info (name, graduation year, high school)
   - Import multiple prospects via CSV file
   - Link to registered players if they join later

5. **Tournament Schedule**: Mark which tournaments they'll attend

---

## Admin Panel Guide

### Accessing the Admin Panel

1. Go to `https://girlsbasketballrecruiting.com/admin`
2. Log in with your admin credentials
3. You'll see the main dashboard with all collections

### Managing Colleges

**Location**: Admin Panel > Colleges

The platform has 1,700+ pre-loaded college programs. To add or edit:

1. Click "Colleges" in the sidebar
2. Use search to find a specific college
3. Click to edit or "Create New" to add
4. Fields include:
   - School name
   - City, State
   - Division (D1, D2, D3, NAIA, JUCO)
   - Conference
   - Type (Public/Private)

### Managing Tournaments

**Location**: Admin Panel > Tournaments

1. Click "Tournaments" in the sidebar
2. Create new tournaments with:
   - Tournament name
   - City, State
   - Start and end dates
   - Description
   - Website URL

### Creating Promotional Codes

**Location**: Admin Panel > Invitations

To create a "first year free" invitation:

1. Click "Invitations" in the sidebar
2. Click "Create New"
3. Configure:
   - **Role**: Select "Player" or "Coach"
   - **Promo Code**: Usually "FIRST_YEAR_FREE"
   - **Invited Email** (optional): Restrict to specific email
   - **Expires At**: Set expiration date
4. Save - an invitation URL is automatically generated
5. Share the URL with the recipient

When they sign up using that URL, their first year is free.

### Viewing Users

**Location**: Admin Panel > Users

View all registered users with their:
- Email and name
- Role (player, coach, admin)
- Subscription status
- Clerk ID (for cross-referencing)

### Viewing Player Profiles

**Location**: Admin Panel > Players

View all player profiles including:
- Full profile details
- Stats and academic info
- Which programs they've saved
- Tournament attendance

### Viewing Coach Profiles

**Location**: Admin Panel > Coaches

View all coach profiles including:
- College affiliation
- Contact information
- Their saved players and prospects

---

## Managing Subscriptions

### In Stripe Dashboard

#### Viewing Revenue

1. Go to `dashboard.stripe.com`
2. Click "Payments" to see recent transactions
3. Click "Subscriptions" to see active subscriptions

#### Issuing a Refund

1. Go to Stripe Dashboard > Payments
2. Find the payment
3. Click the payment, then "Refund"
4. Enter amount and reason

#### Creating a Coupon Code

1. Go to Stripe Dashboard > Products > Coupons
2. Click "Create coupon"
3. Configure:
   - Name (e.g., "SUMMER2024")
   - Discount type (percentage or fixed amount)
   - Duration (once, forever, or number of months)
4. Save and share the code

#### Handling Failed Payments

1. Stripe automatically retries failed payments
2. Check Stripe Dashboard > Payments > filter by "Failed"
3. You can manually retry or reach out to the customer

---

## Common Tasks

### How to Give Someone Free Access

**Option 1: Create an Invitation**
1. Admin Panel > Invitations > Create New
2. Set their email and expiration date
3. Send them the generated URL

**Option 2: Apply Coupon in Stripe**
1. Create a 100% off coupon in Stripe
2. Share the coupon code with the user
3. They enter it during checkout

### How to Reset a User's Password

1. Go to Clerk Dashboard (`dashboard.clerk.com`)
2. Find the user by email
3. Click "Send password reset email"

### How to Delete a User

**Important**: Deleting a user removes all their data.

1. Go to Clerk Dashboard
2. Find and select the user
3. Click "Delete user"
4. This triggers automatic cleanup:
   - PayloadCMS user record deleted
   - Player/Coach profile deleted
   - All related data (notes, saved items) deleted
   - Stripe subscription canceled

### How to Add a New Tournament

1. Admin Panel > Tournaments > Create New
2. Fill in details
3. Save
4. Tournament immediately appears in the public list

### How to Update a College's Information

1. Admin Panel > Colleges
2. Search for the college
3. Click to edit
4. Make changes and save

---

## Troubleshooting

### User Can't Log In

1. Check if they exist in Clerk Dashboard
2. Have them try "Forgot Password"
3. Check if their email is verified in Clerk
4. If using Google login, ensure Google OAuth is configured

### User Paid But Doesn't Have Access

This usually means the Stripe webhook didn't process correctly.

1. Check Stripe Dashboard > Developers > Webhooks
2. Look for failed webhook events
3. If found, click to retry the webhook
4. Or manually add subscription data in Admin Panel > Users

### User Sees "Profile Not Found"

The Clerk webhook may not have synced yet.

1. Wait 30 seconds and refresh
2. If persists, check Clerk webhook logs
3. User may need to sign out and back in

### Payments Not Showing in Stripe

1. Verify Stripe is in "Live" mode (not test mode)
2. Check webhook configuration in Vercel environment variables
3. Ensure `STRIPE_WEBHOOK_SECRET` is correct

### Website Errors or Down

1. Go to Vercel Dashboard
2. Check "Deployments" for failed builds
3. Check "Functions" for error logs
4. Check "Analytics" for traffic issues

---

## Quick Reference: Key URLs

| System | URL |
|--------|-----|
| Live Website | `https://girlsbasketballrecruiting.com` |
| Admin Panel | `https://girlsbasketballrecruiting.com/admin` |
| Clerk Dashboard | `https://dashboard.clerk.com` |
| Stripe Dashboard | `https://dashboard.stripe.com` |
| Vercel Dashboard | `https://vercel.com/dashboard` |

---

## Quick Reference: Pricing

| Plan | Price | Billing |
|------|-------|---------|
| Player Pro | $39 | Annual |
| Coach Pro | $99 | Annual |
| First Year Free | $0 | Via invitation code |

---

## Quick Reference: User Roles

| Role | Can Do | Can't Do |
|------|--------|----------|
| **Player** | Create profile, save programs, view tournaments | Search other players, take notes |
| **Coach** | Search players, save players, take notes, add prospects | Edit player profiles |
| **Admin** | Everything above + manage colleges, tournaments, users | N/A |

---

## Support Contacts

For technical issues with the platform itself, contact your developer.

For billing/payment issues:
- Minor issues: Handle via Stripe Dashboard
- Major issues: Contact Stripe support

For authentication issues:
- Reset passwords via Clerk Dashboard
- Major issues: Contact Clerk support
