
import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Checking webhooks table schema...');
  try {
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'webhooks' AND column_name = 'events';
    `);
    console.log('Schema Result:', result);
  } catch (error) {
    console.error('Error checking schema:', error);
  }
  process.exit(0);
}

main();
