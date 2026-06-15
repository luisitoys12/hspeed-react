import { readFile } from 'fs/promises';
import path from 'path';
import { pool } from './db';

async function main() {
  if (!pool) {
    console.error('DATABASE_URL not set; cannot run migrations.');
    process.exit(1);
  }
  const migrations = ['001_create_tables.sql', '002_new_features.sql', '003_mundial_features.sql'];
  const client = await pool.connect();
  try {
    for (const m of migrations) {
      const sqlPath = path.join(process.cwd(), 'server', 'migrations', m);
      const sql = await readFile(sqlPath, 'utf-8');
      console.log('Running migration:', m);
      await client.query(sql);
      console.log(`Migration ${m} applied successfully`);
    }
    console.log('All migrations applied successfully');
  } catch (e: any) {
    console.error('Migration failed:', e.message || e);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
