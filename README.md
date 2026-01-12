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
- **CMS/API**: Payload CMS 3.68
- **Database**: PostgreSQL (Vercel Postgres)
- **Authentication**: Clerk (OAuth, email/password)
- **Payments**: Stripe (annual subscriptions)
- **File Storage**: Vercel Blob Storage

### Infrastructure
- **Hosting**: Vercel
- **Analytics**: Vercel Analytics
- **Webhooks**: Clerk → PayloadCMS sync, Stripe → subscription management

## Monorepo Structure

This is a [Turborepo](https://turbo.build/repo) monorepo.

```
├── apps/
│   └── web/              # Main Next.js application
├── packages/
│   ├── ui/               # Shared React component library (shadcn-based)
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
- Access PayloadCMS admin panel at `/admin`

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
  - Contact history (email, phone, text, in-person, video calls, game/campus visits)
  - Interest level tracking (High/Medium/Low/Watching/Not Interested)
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

## Database Schema

| Collection | Description |
|------------|-------------|
| `users` | User accounts with Clerk sync and Stripe subscription data |
| `players` | Player profiles with athletic/academic info |
| `coaches` | Coach profiles with college affiliation |
| `colleges` | 1,700+ college basketball programs |
| `tournaments` | AAU tournament listings |
| `player-saved-programs` | Player's saved college programs |
| `coach-saved-players` | Coach's saved player list |
| `coach-player-notes` | Coach's evaluation notes on players |
| `coach-prospects` | Coach's manually tracked unregistered players |
| `invitations` | Promotional tokens for first-year-free offers |

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+ (required for workspace management)
- PostgreSQL 14+ (via Vercel Postgres or local)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd gbr

# Install dependencies
pnpm install

# Copy environment file
cp apps/web/.env.example apps/web/.env.local

# Edit .env.local with your configuration (see Environment Variables below)

# Run database migrations
pnpm --filter web db:migrate

# Start development server
pnpm dev
```

The app will be available at http://localhost:3000

### Environment Variables

Required variables for `apps/web/.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Database (Vercel Postgres)
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...

# PayloadCMS
PAYLOAD_SECRET=<32+ character random string>

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PLAYER_PRO_YEARLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_COACH_PRO_YEARLY_PRICE_ID=price_...

# App URL (for callbacks and links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

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

## API Routes

### Authentication
- `POST /api/webhooks/clerk` - Clerk webhook for user sync

### Players
- `GET /api/players/list` - List all players (with filters)
- `GET /api/players/me` - Get current player profile
- `GET /api/players/[id]/details` - Get player details
- `POST /api/players/partial` - Update player profile

### Coaches
- `GET /api/coaches/list` - List all coaches
- `GET /api/coaches/[id]/details` - Get coach details

### Programs (Colleges)
- `GET /api/programs` - List programs (with filters)
- `GET /api/programs/[id]` - Get program details
- `GET /api/programs/conferences` - List conferences

### Prospects (Coach feature)
- `GET /api/prospects` - Get coach's prospects
- `POST /api/prospects` - Create prospect
- `POST /api/prospects/import-csv` - Bulk import from CSV
- `GET /api/prospects/[id]` - Get prospect details
- `PUT /api/prospects/[id]` - Update prospect

### Notes & Saved Items
- `GET/POST /api/coach-notes/[coachId]/[playerId]` - Coach player notes
- `GET/POST/DELETE /api/saved-players` - Coach saved players
- `GET/POST/DELETE /api/player-saved-programs` - Player saved programs

### Tournaments
- `GET /api/tournaments/list` - List tournaments
- `POST /api/tournaments/[id]/toggle-attendance` - Toggle attendance

### Payments
- `POST /api/webhooks/stripe` - Stripe webhook for subscriptions

## Deployment

### Vercel (Production)

1. Connect repository to Vercel
2. Set all environment variables in Vercel dashboard
3. Configure webhooks:
   - Clerk: `https://girlsbasketballrecruiting.com/api/webhooks/clerk`
   - Stripe: `https://girlsbasketballrecruiting.com/api/webhooks/stripe`

### Preview Environment

Create a `preview` branch and configure:
1. Separate Vercel project or preview deployment settings
2. Separate Stripe test environment
3. Separate Clerk development instance
4. Separate Vercel Postgres database

## Architecture Notes

### Authentication Flow
1. User signs up via Clerk (email/password or Google OAuth)
2. Clerk webhook syncs user to PayloadCMS
3. User redirected to payment page
4. Stripe checkout completes subscription
5. Stripe webhook updates user subscription data
6. User proceeds to onboarding form

### Access Control
- Row-level security enforced at PayloadCMS collection level
- API helpers (`withPlayer()`, `withCoach()`) enforce role requirements
- Users can only read/modify their own data
- Coaches can view all players but only their own notes/prospects

### Soft Deletes
- Players and Coaches use `deletedAt` field for soft deletion
- Preserves historical data and relationships

## License

[License TBD]

## Support

For questions or issues, create an issue in this repository.
