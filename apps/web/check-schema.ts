import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
});

async function checkSchema() {
  const result = await pool.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'players'
    ORDER BY ordinal_position
  `);

  console.log('Players table columns:');
  result.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));

  await pool.end();
}

checkSchema().catch(console.error);
