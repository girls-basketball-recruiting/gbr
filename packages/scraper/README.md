# College Scraper

Scrapes women's college basketball programs from NCSA Sports and imports into Payload CMS.

## Setup

1. Create a `.env` file based on `.env.example`
2. Add your database connection string (same as your web app)
3. Install dependencies:

```bash
cd packages/scraper
pnpm install
```

## Usage

### Scrape Data from NCSA

```bash
pnpm scrape
```

This saves data to `colleges-data.json`.

### Import Data to Payload CMS

```bash
pnpm import
```

This imports the JSON data into your Payload database.

Or from the root:

```bash
pnpm --filter @workspace/scraper scrape
pnpm --filter @workspace/scraper import
```

## What it does

### Scraping (`pnpm scrape`)

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
5. Saves to `colleges-data.json`

### Importing (`pnpm import`)

1. Reads `colleges-data.json`
2. Connects to Payload CMS
3. Clears existing colleges
4. Imports all colleges in batches
5. Data is immediately available to the frontend

## Data Structure

Each college has:
```typescript
interface College {
  school: string
  city: string
  state: string
  type: 'public' | 'private'
  conference: string
  division: 'd1' | 'd2' | 'd3' | 'naia' | 'juco' | 'other'
}
```

## Scripts

- `pnpm scrape` - Scrape colleges from NCSA and save to JSON
- `pnpm debug` - Debug scraping with visible browser
- `pnpm parse` - Parse HTML from saved file
- `pnpm import` - Import colleges from JSON to Payload CMS

## Frontend Integration

The frontend (`CollegesProvider`) automatically fetches all colleges from Payload CMS on app load and caches them in React context for instant autocomplete functionality.
