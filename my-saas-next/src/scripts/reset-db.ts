
import * as dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) process.exit(1);

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  console.log('🗑️ Dropping all tables...');
  await db.execute(sql`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
  
  console.log('🔌 Enabling extensions...');
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);
  
  console.log('✅ Public schema reset and extensions enabled.');

  await client.end();
}

main();
