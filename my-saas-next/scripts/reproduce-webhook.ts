
import { db } from '../src/db';
import { webhooks } from '../src/db/schema';
import { sql } from 'drizzle-orm';
import crypto from 'crypto';

async function main() {
  const teamId = '0b477281-1a51-4f92-9ea4-f3bc2b1f5ef4'; // From the error log
  const data = {
    url: 'https://test.com',
    events: ['invoice.created']
  };

  console.log('Attempting to create webhook...');
  const secret = 'whsec_' + crypto.randomBytes(24).toString('hex');
  
  try {
     const [webhook] = await db.insert(webhooks).values({
      teamId,
      url: data.url,
      events: sql`${JSON.stringify(data.events)}::jsonb`,
      secret,
      isActive: true
    }).returning();
    console.log('Webhook created successfully:', webhook);
  } catch (error) {
    console.error('Error creating webhook:', error);
  }
  process.exit(0);
}

main();
