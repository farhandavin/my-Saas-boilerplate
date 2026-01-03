// Script to drop all old PascalCase tables
const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL);

async function dropTables() {
  console.log('Dropping old PascalCase tables...');
  
  const tables = [
    'WebhookDelivery',
    'Webhook',
    'SystemLog',
    'MigrationJob',
    'Invoice',
    'Transaction',
    'UsageBilling',
    'OnboardingProgress',
    'PasswordResetToken',
    'Notification',
    'AuditLog',
    'ApiKey',
    'Document',
    'Invitation',
    'TeamMember',
    'Team',
    'User',
  ];

  for (const table of tables) {
    try {
      await sql.unsafe(`DROP TABLE IF EXISTS "${table}" CASCADE`);
      console.log(`✓ Dropped ${table}`);
    } catch (err) {
      console.error(`✗ Failed to drop ${table}:`, err.message);
    }
  }

  console.log('Done! Now run: npm run db:push');
  await sql.end();
}

dropTables().catch(console.error);
