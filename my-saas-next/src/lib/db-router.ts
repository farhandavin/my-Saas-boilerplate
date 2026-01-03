
import { TenantDatabaseService } from '@/services/tenantDatabaseService';
import { db as sharedDb } from '@/db';

/**
 * Get the appropriate database connection for a specific team context.
 * Automatically handles routing to dedicated databases for Enterprise tenants.
 * returns sharedDb if teamId is not provided.
 */
export async function getTenantDb(teamId?: string) {
  if (!teamId) return sharedDb;
  return TenantDatabaseService.getConnection(teamId);
}
