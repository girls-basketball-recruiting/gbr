# Girls Basketball Recruiting (GBR) Platform

A modern web platform connecting high school AAU girls basketball players with university basketball program coaches. Built with Next.js 16, Payload CMS, and a focus on performance, security, and user experience.

## Overview

GBR facilitates meaningful connections between talented student-athletes and collegiate basketball programs by providing:

- **Player Profiles**: Comprehensive athletic portfolios with stats, highlights, academic info, and college preferences
- **Coach Dashboard**: Advanced player search, prospect tracking, evaluation notes, and contact history management
- **Tournament Directory**: Browse AAU tournaments and mark attendance for networking
- **College Program Directory**: Browse 1,700+ college basketball programs with filtering by division, state, and more

## Tech Stack

### Frontend

- **Framework**: Next.js 16 (App Router with Server Components)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4 + shadcn/ui component library
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Query (TanStack Query) for server state

### Backend

- **CMS/API**: Payload CMS
- **Database**: PostgreSQL
- **Authentication**: Clerk
- **Payments**: Stripe
- **File Storage**: Vercel Blob Storage

### Infrastructure

- **Hosting**: Vercel
- **Analytics**: Vercel Analytics

## Monorepo Structure

This is a [Turborepo](https://turbo.build/repo) monorepo.

```text
├── apps/
│   └── web/              # Main Next.js application
├── packages/
│   ├── ui/               # Shared React component library
│   ├── scraper/          # College data scraper utility
│   ├── eslint-config/    # Shared ESLint configuration
│   └── typescript-config/# Shared TypeScript config
```

## User Roles

### Players (Student-Athletes)

- Create comprehensive profiles with athletic stats, academics, and video highlights
- Browse and save college programs with personal notes
- Mark tournament attendance to show where they'll be playing
- Annual subscription: $39/year

### Coaches (College Staff)

- Search and filter player profiles with advanced criteria
- Save players to recruiting boards
- Create detailed evaluation notes with contact history tracking
- Track "prospects" (unregistered players) with manual entry
- Import prospects via CSV upload
- Mark tournament attendance to show where they'll be recruiting
- Annual subscription: $99/year

### Admin

- Manage colleges and tournaments database
- Create promotional invitation tokens
- Access content management system

## Key Features

### For Players

- Multi-step onboarding with progress tracking
- Profile fields: bio, position, stats (PPG/RPG/APG), height/weight, GPA, awards
- AAU/Club team information
- Up to 10 highlight video URLs
- College preferences (divisions, geography, school types)
- NCAA ID tracking
- Profile image upload

### For Coaches

- Advanced player search with filters:
  - Graduation year, position, location
  - GPA range, height/weight range
- Player evaluation notes:
  - General notes and observations
  - Contact history tracking
  - Interest level tracking
  - Custom tags for organization
  - Follow-up reminders
- Prospects management:
  - Add unregistered players manually
  - CSV bulk import with validation
  - Link to registered players when they join
- Saved players board

### Public Access

- Browse player profiles (limited view with sign-up CTA)
- Browse college programs directory
- Browse AAU tournaments

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+ (required for workspace management)
- PostgreSQL 14+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd gbr

# Install dependencies
pnpm install

# Copy environment file
cp apps/web/.env.example apps/web/.env.local

# Edit .env.local with your configuration

# Run database migrations
pnpm --filter web db:migrate

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

### Environment Variables

See `apps/web/.env.example` for the required environment variables. You'll need credentials for:

- Clerk (authentication)
- PostgreSQL database
- Stripe (payments)
- Vercel Blob Storage (file uploads)

## Available Scripts

### Development

- `pnpm dev` - Start all apps in development mode
- `pnpm dev:web` - Start only the web app

### Building

- `pnpm build` - Build all apps and packages
- `pnpm build:web` - Build the web app only

### Code Quality

- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript compiler checks

### Database

- `pnpm --filter web db:migrate` - Run database migrations
- `pnpm --filter web generate:types` - Generate Payload types

## Deployment

### Vercel (Production)

1. Connect repository to Vercel
2. Set all environment variables in Vercel dashboard
3. Configure webhooks in Clerk and Stripe dashboards

### Preview Environment

See `PREVIEW_ENVIRONMENT_SETUP.md` for detailed instructions on setting up a preview/staging environment.

## Architecture Notes

### Authentication Flow

1. User signs up via Clerk (email/password or Google OAuth)
2. Webhook syncs user to database
3. User redirected to payment page
4. Stripe checkout completes subscription
5. Webhook updates user subscription data
6. User proceeds to onboarding form

### Access Control

- Row-level security enforced at collection level
- API helpers enforce role requirements
- Users can only read/modify their own data
- Coaches can view all players but only their own notes/prospects

### Soft Deletes

- Players and Coaches use `deletedAt` field for soft deletion
- Preserves historical data and relationships

## License

[License TBD]

## Support

For questions or issues, create an issue in this repository.
