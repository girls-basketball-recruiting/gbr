# College Scraper

Scrapes women's college basketball programs from NCSA Sports and uploads to Vercel Edge Config.

## Setup

1. Create a `.env` file based on `.env.example`
2. Get your Edge Config ID and Vercel token from the Vercel dashboard
3. Install dependencies:

```bash
cd packages/scraper
pnpm install
```

## Usage

Run the scraper manually (from the scraper directory):

```bash
pnpm scrape
```

Or from the root:

```bash
pnpm --filter @workspace/scraper scrape
```

## What it does

1. Launches a headless browser with Puppeteer
2. Navigates to https://www.ncsasports.org/womens-basketball/colleges
3. Waits for the dynamic table to load
4. Extracts all colleges with their:
   - School name
   - City
   - State
   - Type (Public/Private)
   - Conference
   - Division
5. Uploads the data to Vercel Edge Config

## Data Structure

Each college has:
```typescript
interface College {
  school: string
  city: string
  state: string
  type: string
  conference: string
  division: string
}
```

## Edge Config Keys

- `colleges`: Array of all college data
- `lastUpdated`: ISO timestamp of last scrape
- `totalCount`: Number of colleges
