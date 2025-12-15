# College Data Management

This package contains scripts to scrape and import college data.

## Data Flow

```
NCSA Website → Scraper → Payload CMS → Frontend
```

1. **Scraper** - Scrapes college data from NCSA website
2. **Payload CMS** - Source of truth, serves data to frontend via API
3. **Frontend** - Fetches colleges on app load, cached in React context

## Scripts

### 1. Scrape Colleges
```bash
pnpm --filter @workspace/scraper scrape
```
Scrapes college data from the NCSA website and saves to `colleges-data.json`.

### 2. Import to Payload CMS
```bash
pnpm --filter @workspace/scraper import
```
Imports colleges from `colleges-data.json` into Payload CMS database.

**Note:** This clears existing colleges before importing!

## Full Update Process

When you need to update college data:

```bash
# 1. Scrape latest data from NCSA
pnpm --filter @workspace/scraper scrape

# 2. Import into Payload CMS (this immediately updates the frontend)
pnpm --filter @workspace/scraper import
```

That's it! The frontend automatically fetches from Payload CMS.

## Manual College Updates

You can also manually update colleges through the Payload admin UI:

1. Go to `https://your-domain.com/admin`
2. Navigate to Collections > Colleges
3. Add/Edit/Delete colleges as needed
4. Changes are immediately available to the frontend (users will see updates on next page load)

## Frontend Behavior

The frontend (`CollegesProvider`) will:
1. Fetch all colleges from Payload CMS on app load
2. Cache the data in React context for the session
3. Provide instant autocomplete without additional API calls

**Performance:**
- Initial load: ~100-200ms for 900+ colleges
- Subsequent searches: Instant (in-memory filtering)
- Data is indexed in Postgres for fast queries

## Environment Setup

Make sure these variables are set in your `.env.local`:

```bash
# Database
DATABASE_URL=postgresql://...
```
