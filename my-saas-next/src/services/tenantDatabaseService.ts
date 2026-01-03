// src/services/tenantDatabaseService.ts
// Hybrid Multi-Tenancy: Database Router for Enterprise Tier
// Allows Enterprise customers to use dedicated database while FREE/PRO use shared

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { db as sharedDb } from '@/db';
import { teams } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as schema from '@/db/schema';

// Cache for tenant database connections
const connectionCache = new Map<string, ReturnType<typeof drizzle>>();

export const TenantDatabaseService = {
  /**
   * Get the appropriate database connection for a team
   * - FREE/PRO: Returns shared database
   * - ENTERPRISE with dedicated_database_url: Returns dedicated connection
   */
  async getConnection(teamId: string) {
    // First check cache
    if (connectionCache.has(teamId)) {
      return connectionCache.get(teamId)!;
    }

    // Get team info
    const team = await sharedDb.query.teams.findFirst({
      where: eq(teams.id, teamId),
      columns: {
        tier: true,
        dedicatedDatabaseUrl: true,
        tenancyMode: true
      }
    });

    // FREE/PRO or no dedicated URL = use shared database
    if (!team || team.tier !== 'ENTERPRISE' || !team.dedicatedDatabaseUrl) {
      return sharedDb;
    }

    // ENTERPRISE with dedicated URL = create new connection
    try {
      const client = postgres(team.dedicatedDatabaseUrl, {
        max: 5, // Limit connections per tenant
        idle_timeout: 300,
        connect_timeout: 10
      });
      
      const dedicatedDb = drizzle(client, { schema });
      
      // Cache the connection
      connectionCache.set(teamId, dedicatedDb);
      
      console.log(`[TenantDB] Created dedicated connection for team ${teamId}`);
      return dedicatedDb;
    } catch (error) {
      console.error(`[TenantDB] Failed to connect to dedicated DB for team ${teamId}:`, error);
      // Fallback to shared database
      return sharedDb;
    }
  },

  /**
   * Check if team is using dedicated database
   */
  async isDedicated(teamId: string): Promise<boolean> {
    const team = await sharedDb.query.teams.findFirst({
      where: eq(teams.id, teamId),
      columns: { tenancyMode: true, dedicatedDatabaseUrl: true }
    });

    return team?.tenancyMode === 'dedicated' && !!team.dedicatedDatabaseUrl;
  },

  /**
   * Configure dedicated database for Enterprise team
   */
  async configureDedicatedDatabase(teamId: string, databaseUrl: string) {
    // Validate connection first
    try {
      const testClient = postgres(databaseUrl, { max: 1, connect_timeout: 5 });
      await testClient`SELECT 1`;
      await testClient.end();
    } catch (error) {
      throw new Error(`Cannot connect to database: ${error}`);
    }

    // Update team configuration
    await sharedDb.update(teams)
      .set({ 
        dedicatedDatabaseUrl: databaseUrl,
        tenancyMode: 'dedicated'
      })
      .where(eq(teams.id, teamId));

    // Clear cache to force reconnection
    connectionCache.delete(teamId);

    console.log(`[TenantDB] Configured dedicated database for team ${teamId}`);
    return { success: true };
  },

  /**
   * Revert to shared database
   */
  async revertToShared(teamId: string) {
    await sharedDb.update(teams)
      .set({ 
        dedicatedDatabaseUrl: null,
        tenancyMode: 'shared'
      })
      .where(eq(teams.id, teamId));

    // Clear cache
    connectionCache.delete(teamId);

    return { success: true };
  },

  /**
   * Get tenancy info for a team
   */
  async getTenancyInfo(teamId: string) {
    const team = await sharedDb.query.teams.findFirst({
      where: eq(teams.id, teamId),
      columns: {
        tier: true,
        tenancyMode: true,
        dedicatedDatabaseUrl: true
      }
    });

    if (!team) return null;

    return {
      tier: team.tier,
      tenancyMode: team.tenancyMode || 'shared',
      hasDedicatedDb: !!team.dedicatedDatabaseUrl,
      // Mask URL for security
      databaseUrlPreview: team.dedicatedDatabaseUrl 
        ? team.dedicatedDatabaseUrl.replace(/:[^@]+@/, ':***@') 
        : null
    };
  },

  /**
   * Clean up connection when team is deleted or downgrades
   */
  cleanupConnection(teamId: string) {
    connectionCache.delete(teamId);
  }
};
