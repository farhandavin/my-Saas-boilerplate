
import * as dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  console.log('Testing connection to:', connectionString.replace(/:[^:@]*@/, ':****@')); // Mask password

  try {
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client);
    
    const result = await db.execute('SELECT 1');
    console.log('✅ Connection successful!', result);
    
    await client.end();
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

main();
