# Girls Basketball Recruiting Platform

A modern web platform connecting high school AAU girls basketball players with university basketball program coaches. Built with a focus on performance, scalability, and user experience.

## 🏀 Overview

This platform facilitates meaningful connections between talented student-athletes and collegiate basketball programs by providing:

- **Player Profiles**: Comprehensive athletic portfolios with stats, highlights, and academic information
- **Coach Dashboard**: Advanced search and filtering tools for discovering talent

## 📁 Repository Structure

This is a [Turborepo](https://turbo.build/repo) monorepo. See [TURBOREPO.md](./TURBOREPO.md) for detailed information about the monorepo architecture and tooling.

**apps/** - Application packages

- **web/** - Next.js player-facing application
- **coach-portal/** - Next.js coach dashboard (TODO)
- **api/** - Backend API service (TODO)

**packages/** - Shared packages

- **ui/** - Shared React component library
- **database/** - Prisma schema and database utilities (TODO)
- **typescript-config/** - Shared TypeScript configurations
- **eslint-config/** - Shared ESLint configurations
- **auth/** - Authentication utilities (TODO)
- **utils/** - Shared utility functions

## 🚀 Tech Stack

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **Component Library**: Custom components built on Radix UI primitives
- **State Management**: React Server Components + Zustand (TODO)
- **Forms**: React Hook Form + Zod validation

### Backend (TODO)

- **Runtime**: Node.js
- **Framework**: Nest.js or Express (TBD)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: BetterAuth or Clerk (TBD)
- **File Storage**: AWS S3 or Cloudflare R2 for video content

### Infrastructure

- **Hosting**: Vercel (frontend) + Railway/Fly.io (backend - TBD)
- **CI/CD**: GitHub Actions
- **Monitoring and Analytics**: PostHog

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+ (required for workspace management)
- PostgreSQL 14+ (for local development - TODO)

### Installation

Clone the repository and install dependencies:

    git clone <repository-url>
    cd basketball-recruiting-platform
    pnpm install

Set up environment variables:

    cp .env.example .env.local

Edit .env.local with your configuration, then run database migrations (TODO):

    pnpm db:migrate

Start development servers:

    pnpm dev

This will start:

- Player web app: http://localhost:3000
- Coach portal: http://localhost:3001 (TODO)
- API server: http://localhost:4000 (TODO)

## 📦 Available Scripts

**Development**

- `pnpm dev` - Start all apps in development mode
- `pnpm dev:web` - Start only the player web app
- `pnpm dev:coach` - Start only the coach portal (TODO)

**Building**

- `pnpm build` - Build all apps and packages
- `pnpm build:web` - Build specific app

**Testing**

- `pnpm test` - Run all tests (TODO)
- `pnpm test:unit` - Run unit tests (TODO)
- `pnpm test:e2e` - Run end-to-end tests (TODO)

**Code Quality**

- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript compiler checks

**Database (TODO)**

- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with test data
- `pnpm db:studio` - Open Prisma Studio

## 🏗️ Architecture

### Design Principles

1. **Mobile-first**: Responsive design optimized for mobile recruiting
2. **Performance**: Server-side rendering, image optimization, lazy loading
3. **Accessibility**: WCAG 2.1 AA compliance target
4. **Type Safety**: End-to-end TypeScript with strict mode
5. **Modularity**: Shared packages for reusability across apps

### Key Features (Planned)

#### For Players

- Profile creation with stats, bio, and academic info
- Video highlight upload and management
- University program discovery and search
- Message inbox for coach communications
- Recruitment timeline tracking
- Mobile-responsive design

#### For Coaches

- Advanced player search with filters (position, class year, location, stats)
- Saved player lists and boards
- Bulk messaging capabilities
- Compliance tools for NCAA/NAIA regulations
- Analytics dashboard
- Team collaboration features

#### Admin (Future)

- User management
- Content moderation
- Platform analytics
- Feature flags

## 🔐 Authentication & Authorization (TODO)

- **Player Accounts**: Email/password + OAuth (Google)
- **Coach Accounts**: Email verification + university affiliation verification
- **Role-based Access Control**: Player, Coach, Admin roles
- **Session Management**: JWT tokens with refresh mechanism

## 📊 Database Schema (TODO)

Key entities:

- Users (players, coaches, admins)
- Player Profiles
- Coach Profiles
- Universities/Programs
- Videos
- Messages
- Recruitment Activities

See `packages/database/schema.prisma` for complete schema.

## 🎨 Design System

The shared UI package provides a consistent design system across all applications:

- Typography scale
- Color palette (brand colors, semantic colors)
- Spacing system
- Component library
- Icon set

See `packages/ui/README.md` for component documentation.

## Usage

```bash
pnpm dlx shadcn@latest init
```

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button";
```

## 🚢 Deployment

### TODO

## 🤝 Contributing

This is currently a private project. Contributing guidelines will be added when the project opens for collaboration.

## 📝 License

[License TBD]

## 🗺️ Roadmap

### Phase 1: MVP (Current)

- [x] Project setup and monorepo architecture
- [x] Design system and UI component library
- [x] Player profile creation
- [x] Basic search functionality
- [ ] Video upload integration
- [x] Authentication system

### Phase 2: Core Features

- [x] Advanced search and filtering
- [x] Coach dashboard

### Phase 3: Growth Features

- [ ] Analytics and insights
- [ ] Recruitment tracking
- [ ] Team collaboration tools
- [ ] Premium features/subscriptions

### Phase 4: Scale

- [ ] API for third-party integrations
- [ ] Webhooks and event system
- [ ] Advanced analytics
- [ ] Multi-sport expansion

## 📞 Support

For questions or issues:

- Create an issue in this repository
- Contact: [contact email TBD]

## 🔗 Related Documentation

- [Turborepo Setup](./TURBOREPO.md) - Monorepo architecture and configuration
- [Design System](./packages/ui/README.md) - Component library documentation

---
