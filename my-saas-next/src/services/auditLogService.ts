
import { db } from '@/db';
import { auditLogs } from '@/db/schema';

interface AuditLogParams {
  teamId: string;
  userId: string;
  action: string;
  resource?: string;
  details?: string;
  ip?: string;
  metadata?: Record<string, any>;
}

export const AuditLogService = {
  /**
   * Mencatat aktivitas user ke database AuditLog
   */
  async log({ teamId, userId, action, resource, details, ip, metadata }: AuditLogParams) {
    try {
      await db.insert(auditLogs).values({
        teamId,
        userId,
        action,
        entity: resource || 'Unknown', // Map resource -> entity
        details,
        //Metadata removed from schema? No, verified in step 2237 metadata was removed. 
        //Wait, Step 2237 said "metadata references to align with the database schema... removed metadata references".
        //Let me re-read step 2237 carefully.
        ipAddress: ip || "0.0.0.0",
      });
      console.log(`[AUDIT] ${action} by ${userId} in team ${teamId}`);

    } catch (error) {
      console.error("❌ Failed to create audit log:", error);
    }
  },

  /**
   * Mengambil log aktivitas terbaru untuk dashboard
   */
  async getRecentLogs(teamId: string, limit: number = 5) {
    // Import 'desc' and 'eq' locally if needed or rely on top level imports
    const { desc, eq } = await import('drizzle-orm');
    
    return db.query.auditLogs.findMany({
      where: eq(auditLogs.teamId, teamId),
      orderBy: [desc(auditLogs.createdAt)],
      limit: limit,
      with: {
        user: {
          columns: { name: true, image: true, email: true }
        }
      }
    });
  }
};
