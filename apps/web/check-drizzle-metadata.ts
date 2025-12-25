import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
});

async function checkMetadata() {
  try {
    // Check if drizzle metadata table exists
    const schemaResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'drizzle'
    `);

    console.log('\n📋 Drizzle schema tables:');
    schemaResult.rows.forEach(row => console.log(`  - ${row.table_name}`));

    // Check migrations
    if (schemaResult.rows.length > 0) {
      const migrationsResult = await pool.query(`
        SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at
      `);

      console.log('\n📦 Migrations in database:');
      migrationsResult.rows.forEach(row => {
        console.log(`  - ${row.hash} (${new Date(row.created_at).toISOString()})`);
      });
    }
  } catch (error: any) {
    console.log('\n⚠️  Error checking drizzle metadata:', error.message);
  }

  await pool.end();
}

checkMetadata().catch(console.error);
