
import { TenantDatabaseService } from '@/services/tenantDatabaseService';
import { db as sharedDb } from '@/db';
import { sql } from 'drizzle-orm';

// Type alias for the database connection
type DbConnection = typeof sharedDb;

/**
 * Get the appropriate database connection for a specific team context.
 * Automatically handles routing to dedicated databases for Enterprise tenants.
 * Returns sharedDb if teamId is not provided.
 */
export async function getTenantDb(teamId?: string): Promise<DbConnection> {
  if (!teamId) return sharedDb;
  const connection = await TenantDatabaseService.getConnection(teamId);
  return connection as DbConnection;
}

/**
 * Set the current tenant context for RLS enforcement.
 * This MUST be called before any tenant-scoped queries to enable
 * database-level Row Level Security protection.
 * 
 * @param teamId - The team ID to set as current context (null for superadmin/bypass)
 * 
 * @example
 * // In API routes or services:
 * await setTenantContext(teamId);
 * const projects = await db.select().from(projects); // Automatically filtered by RLS
 */
export async function setTenantContext(teamId: string | null): Promise<DbConnection> {
  const dbConnection = await getTenantDb(teamId ?? undefined);

  if (teamId) {
    // Set session variable for RLS policies
    await dbConnection.execute(
      sql`SELECT set_config('app.current_team_id', ${teamId}, true)`
    );
  } else {
    // Clear context for superadmin access (bypasses RLS)
    await dbConnection.execute(
      sql`SELECT set_config('app.current_team_id', '', true)`
    );
  }

  return dbConnection;
}

/**
 * Execute a function within a tenant context.
 * Automatically sets and clears the RLS context.
 * 
 * @param teamId - The team ID for context (null for superadmin)
 * @param fn - Async function to execute within the context
 * @returns The result of the function
 * 
 * @example
 * const projects = await withTenantContext(teamId, async (db) => {
 *   return await db.select().from(projects);
 * });
 */
export async function withTenantContext<T>(
  teamId: string | null,
  fn: (db: DbConnection) => Promise<T>
): Promise<T> {
  const dbConnection = await setTenantContext(teamId);
  try {
    return await fn(dbConnection);
  } finally {
    // Clear context after execution
    await dbConnection.execute(
      sql`SELECT set_config('app.current_team_id', '', true)`
    );
  }
}

/**
 * Type guard to check if RLS context is set
 */
export async function hasTenantContext(): Promise<boolean> {
  const result = await sharedDb.execute(
    sql`SELECT current_setting('app.current_team_id', true) as team_id`
  );
  // Access result directly - Drizzle returns array-like structure
  const firstRow = (result as unknown as Array<{ team_id: string }>)[0];
  return Boolean(firstRow?.team_id);
}

