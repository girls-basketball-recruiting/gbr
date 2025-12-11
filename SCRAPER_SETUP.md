# College Scraper Setup Guide

This guide will help you set up and run the college basketball program scraper.

## 1. Create Vercel Edge Config

1. Go to your Vercel dashboard
2. Navigate to **Storage** → **Edge Config**
3. Click **Create Edge Config**
4. Name it `colleges` (or any name you prefer)
5. After creation, you'll see:
   - **Edge Config ID** (starts with `ecfg_`)
   - **Connection String** (starts with `https://edge-config.vercel.com/`)

## 2. Set Environment Variables

### For the Next.js app (`apps/web/.env`):
```bash
EDGE_CONFIG=https://edge-config.vercel.com/...your-connection-string
```

This is automatically set when you deploy to Vercel, but for local development you need to add it manually.

### For the scraper (`packages/scraper/.env`):
```bash
EDGE_CONFIG_ID=ecfg_your_edge_config_id
VERCEL_TOKEN=your_vercel_token
```

To get your Vercel token:
1. Go to https://vercel.com/account/tokens
2. Create a new token with scope to access your Edge Config
3. Copy the token

## 3. Install Dependencies

From the root of the monorepo:
```bash
pnpm install
```

## 4. Run the Scraper

From the root:
```bash
pnpm scrape:colleges
```

Or from the scraper package:
```bash
cd packages/scraper
pnpm scrape
```

This will:
1. Launch a headless browser
2. Navigate to the NCSA women's basketball colleges page
3. Wait for the dynamic table to load
4. Extract all college data (School, City, State, Type, Conference, Division)
5. Upload the data to Vercel Edge Config

## 5. Verify the Data

After running the scraper, you can verify the data was uploaded:

1. Check the Vercel Edge Config dashboard
2. Or test the API endpoint locally:
```bash
curl http://localhost:3000/api/colleges
```

## API Endpoints

Once the data is uploaded, these endpoints become available:

### Get all colleges
```
GET /api/colleges
```

Returns all colleges with metadata:
```json
{
  "colleges": [...],
  "metadata": {
    "lastUpdated": "2025-01-01T00:00:00.000Z",
    "totalCount": 1234
  }
}
```

### Search colleges
```
GET /api/colleges/search?q=stanford&division=d1&state=CA&type=Private
```

Query parameters:
- `q`: Search query (searches school name, city, conference)
- `division`: Filter by division (D1, D2, D3, NAIA, etc.)
- `state`: Filter by state code (CA, TX, etc.)
- `type`: Filter by type (Public, Private)

### Get statistics
```
GET /api/colleges/stats
```

Returns aggregated statistics:
```json
{
  "total": 1234,
  "byDivision": { "D1": 350, "D2": 300, ... },
  "byState": { "CA": 45, "TX": 38, ... },
  "byType": { "Public": 800, "Private": 434 },
  "topStates": [
    { "state": "CA", "count": 45 },
    ...
  ]
}
```

## Maintenance

Run the scraper **once or twice a year** to keep the college list up to date:

1. Run `pnpm scrape:colleges`
2. Verify the data in Vercel dashboard or via API
3. The data will be immediately available to your Next.js app (no deployment needed)

## Troubleshooting

### Scraper returns 0 colleges
- The website structure may have changed
- Check the console output for errors
- Verify the selectors in `packages/scraper/src/index.ts`

### Edge Config upload fails
- Verify your `EDGE_CONFIG_ID` and `VERCEL_TOKEN` are correct
- Check token permissions include Edge Config access
- Verify the Edge Config exists in your Vercel account

### API returns 404
- Ensure `EDGE_CONFIG` environment variable is set in your Next.js app
- Verify the data was successfully uploaded to Edge Config
- Redeploy your Next.js app if needed
