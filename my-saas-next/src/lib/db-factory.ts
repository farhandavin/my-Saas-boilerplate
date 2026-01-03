
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';
import { db as globalDb } from '../db';
import { eq } from 'drizzle-orm';
import { teams } from '../db/schema';

/**
 * DB Factory: The core of Hybrid Multi-Tenancy
 * 
 * Strategy:
 * 1. SHARE_TIER (Free/Pro): Returns the global connection string (Project Default).
 * 2. ISOLATED_TIER (Enterprise): dynamic connection to a specific database URL.
 */

// Cache for reuse of connections (Serverless optimal)
const connectionCache: Record<string, PostgresJsDatabase<typeof schema>> = {};

export const getTenantDb = async (teamId: string): Promise<PostgresJsDatabase<typeof schema>> => {
  // 1. Fetch team metadata to decide strategy
  // We use the global/shared instance to lookup routing info
  const team = await globalDb.query.teams.findFirst({
    where: eq(teams.id, teamId),
    columns: {
      id: true,
      tier: true,
      dedicatedDatabaseUrl: true
    }
  });

  if (!team) {
    throw new Error(`Tenant Routing Error: Team ${teamId} not found`);
  }

  // 2. Routing Logic
  
  // A. Shared Database (Free/Pro or Enterprise without dedicated DB provisioned yet)
  if (team.tier !== 'ENTERPRISE' || !team.dedicatedDatabaseUrl) {
    return globalDb;
  }

  // B. Isolated Database (Enterprise)
  const dbUrl = team.dedicatedDatabaseUrl;

  // Check cache first
  if (connectionCache[dbUrl]) {
    return connectionCache[dbUrl];
  }

  // Create new connection if not cached
  console.log(`🔌 [DB Factory] Opening dynamic connection for Team ${team.tier} (${team.id})`);
  
  // Disable prefetch as it is not supported for "Transaction" pool mode if using pooling
  const client = postgres(dbUrl, { prepare: false });
  const tenantDb = drizzle(client, { schema });

  // Store in cache
  connectionCache[dbUrl] = tenantDb;
  
  return tenantDb;
};
