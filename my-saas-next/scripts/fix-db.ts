
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Enabling vector extension...');
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector`);
  console.log('Truncating api_keys table...');
  await db.delete(apiKeys);
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
