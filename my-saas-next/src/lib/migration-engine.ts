
// src/lib/migration-engine.ts
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

/**
 * Pillar 2: Seamless Migration Engine
 * "The Bridge". Automates data movement from Shared -> Isolated DB.
 */
export const MigrationEngine = {
  /**
   * 1. Lock Source (Read-only mode effectively, or flag in DB)
   */
  async lockTenant(teamId: string) {
    console.log(`🔒 Locking tenant ${teamId}...`);
    await db.update(schema.teams)
      .set({ migrationStatus: 'IN_PROGRESS' })
      .where(eq(schema.teams.id, teamId));
  },

  /**
   * 2. Copy Data (ETL)
   * Transfers data from Shared DB to Isolated DB.
   */
  async copyData(teamId: string, targetDbUrl: string) {
    console.log(`📦 Copying data for ${teamId} to ${targetDbUrl}...`);
    
    // 1. Connect to Target Database
    const targetClient = postgres(targetDbUrl, { prepare: false });
    const targetDb = drizzle(targetClient, { schema });

    try {
      // 2. Fetch Source Data
      const teamData = await db.query.teams.findFirst({ where: eq(schema.teams.id, teamId) });
      if (!teamData) throw new Error(`Team ${teamId} not found`);

      // 3. Insert Team Record to Target (Required for Foreign Keys)
      console.log(`   > Migrating Team Record...`);
      await targetDb.insert(schema.teams).values(teamData).onConflictDoNothing();

      // 4. Migrate Related Entities
      // Helper to migrate table data
      const migrateTable = async <T extends keyof typeof schema>(
        tableName: T, 
        drizzleTable: any, 
        foreignKeyField: string = 'teamId'
      ) => {
        // @ts-ignore - Dynamic query based on schema
        const records = await db.query[tableName].findMany({
          where: eq(drizzleTable[foreignKeyField], teamId)
        });

        if (records.length > 0) {
          console.log(`   > Migrating ${records.length} records for ${String(tableName)}...`);
          await targetDb.insert(drizzleTable).values(records).onConflictDoNothing();
        }
      };

      // Define migration order carefully (Parent -> Child)
      await migrateTable('teamMembers', schema.teamMembers);
      await migrateTable('invitations', schema.invitations);
      await migrateTable('apiKeys', schema.apiKeys);
      await migrateTable('documents', schema.documents); // Vector data included
      
      // Billing & Operations
      await migrateTable('usageBillings', schema.usageBillings);
      await migrateTable('invoices', schema.invoices);
      await migrateTable('migrationJobs', schema.migrationJobs);
      
      // Audit Logs & System Logs
      await migrateTable('auditLogs', schema.auditLogs);
      // systemLogs might not have teamId in all cases, but if they do:
      // await migrateTable('systemLogs', schema.systemLogs);

      console.log(`✅ Data copy completed for ${teamId}`);
      return true;

    } catch (error) {
      console.error(`❌ Data copy failed:`, error);
      throw error;
    } finally {
      // 5. Cleanup Connection
      await targetClient.end();
    }
  },

  /**
   * 3. Verify & Switch Router
   */
  async switchTenantToIsolated(teamId: string, newDbUrl: string) {
    console.log(`🔄 Switching router for ${teamId}...`);
    await db.update(schema.teams)
      .set({ 
        tier: 'ENTERPRISE',
        dedicatedDatabaseUrl: newDbUrl,
        migrationStatus: 'COMPLETED'
      })
      .where(eq(schema.teams.id, teamId));
  },

  /**
   * 4. Unlock (On Failure)
   */
  async unlockTenant(teamId: string) {
    console.log(`🔓 Unlocking tenant ${teamId} (Rollback)...`);
    await db.update(schema.teams)
      .set({ migrationStatus: 'FAILED' })
      .where(eq(schema.teams.id, teamId));
  }
};
