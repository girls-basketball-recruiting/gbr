# College Scraper Setup Guide

This guide will help you set up and run the college basketball program scraper.

## Overview

The scraper fetches college data from NCSA and imports it into your Payload CMS database. The frontend automatically fetches this data for the college autocomplete functionality.

## 1. Set Environment Variables

### For the scraper (`packages/scraper/.env`):
```bash
# Database - Same connection string as your web app
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# PayloadCMS - Same secret as your web app
PAYLOAD_SECRET=your_random_secret_here_min_32_chars
```

## 2. Install Dependencies

From the root of the monorepo:
```bash
pnpm install
```

## 3. Run the Scraper

### Option A: Scrape and Import in One Step

From the root:
```bash
cd packages/scraper
pnpm scrape        # Scrapes data and saves to colleges-data.json
pnpm import        # Imports JSON data into Payload CMS
```

### What This Does:

**Scraping:**
1. Launches a headless browser
2. Navigates to the NCSA women's basketball colleges page
3. Waits for the dynamic table to load
4. Extracts all college data (School, City, State, Type, Conference, Division)
5. Saves to `colleges-data.json`

**Importing:**
1. Reads `colleges-data.json`
2. Clears existing colleges from Payload CMS
3. Imports all colleges in batches
4. Data is immediately available to the frontend

## 4. Verify the Data

After importing, you can verify the data:

### Via Payload Admin UI:
1. Go to `http://localhost:3000/admin` (or your deployed URL)
2. Navigate to Collections > Colleges
3. You should see all imported colleges

### Via API:
```bash
curl http://localhost:3000/api/colleges/search?limit=10
```

## API Endpoints

### Search colleges (used by frontend)
```
GET /api/colleges/search?q=stanford&division=d1&state=CA&limit=20
```

Query parameters:
- `q`: Search query (searches school name)
- `division`: Filter by division (d1, d2, d3, naia, juco, other)
- `state`: Filter by state code (CA, TX, etc.)
- `type`: Filter by type (public, private)
- `limit`: Number of results (default 10)

Returns:
```json
{
  "colleges": [...],
  "total": 100,
  "hasMore": true
}
```

### Get statistics
```
GET /api/colleges/stats
```

Returns aggregated statistics:
```json
{
  "total": 902,
  "byDivision": { "d1": 350, "d2": 300, ... },
  "byState": { "CA": 45, "TX": 38, ... },
  "byType": { "public": 468, "private": 434 },
  "topStates": [
    { "state": "CA", "count": 45 },
    ...
  ]
}
```

## Manual College Management

You can manually add/edit/delete colleges through the Payload admin UI:

1. Go to `/admin`
2. Navigate to Collections > Colleges
3. Add/Edit/Delete colleges as needed
4. Changes are immediately available to the frontend

## Maintenance

Run the scraper **once or twice a year** to keep the college list up to date:

1. Run `pnpm scrape` (in packages/scraper)
2. Run `pnpm import` (in packages/scraper)
3. Verify the data in Payload admin
4. The data is immediately available to your app (no deployment needed)

## Troubleshooting

### Scraper returns 0 colleges
- The website structure may have changed
- Check the console output for errors
- Verify the selectors in `packages/scraper/src/index.ts`

### Import fails
- Verify your `DATABASE_URL` and `PAYLOAD_SECRET` are correct
- Ensure the database is accessible
- Check that `colleges-data.json` exists and is valid JSON

### API returns empty results
- Ensure data was successfully imported to Payload
- Check Payload admin UI to verify colleges exist
- Check browser console for API errors
