// scripts/run-rls-migration.ts
// Run with: npx tsx scripts/run-rls-migration.ts

import { readFileSync } from 'fs';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error('❌ DATABASE_URL not found in .env');
        process.exit(1);
    }

    console.log('🔄 Connecting to database...');

    const pool = new Pool({ connectionString: databaseUrl });

    try {
        // Read the SQL file
        const sql = readFileSync('drizzle/0001_enable_rls.sql', 'utf-8');

        console.log('📜 Running RLS migration...');

        // Execute the migration
        await pool.query(sql);

        console.log('✅ RLS migration completed successfully!');
        console.log('');
        console.log('Protected tables:');
        console.log('  - projects, project_members, tasks');
        console.log('  - documents, invoices, campaigns');
        console.log('  - team_members, invitations, roles');
        console.log('  - audit_logs, notifications, webhooks');
        console.log('  - api_keys, privacy_rules, usage_billings');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
