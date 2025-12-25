import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
});

async function checkViews() {
  // Check for any views that might reference old columns
  const viewsResult = await pool.query(`
    SELECT table_name, view_definition
    FROM information_schema.views
    WHERE table_schema = 'public'
  `);

  console.log('\n👁️  Views in public schema:');
  if (viewsResult.rows.length === 0) {
    console.log('  (none)');
  } else {
    viewsResult.rows.forEach(row => {
      console.log(`\n  View: ${row.table_name}`);
      console.log(`  Definition: ${row.view_definition}`);
    });
  }

  await pool.end();
}

checkViews().catch(console.error);
