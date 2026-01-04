
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import type { AuditLogMetadata } from '@/types/log-types';

interface AuditLogParams {
  teamId: string;
  userId: string;
  action: string;
  resource?: string;
  details?: string;
  ip?: string;
  metadata?: AuditLogMetadata;
}

export const AuditLogService = {
  /**
   * Mencatat aktivitas user ke database AuditLog
   */
  async log({ teamId, userId, action, resource, details, ip }: AuditLogParams) {
    try {
      await db.insert(auditLogs).values({
        teamId,
        userId,
        action,
        entity: resource || 'Unknown', // Map resource -> entity
        details,
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
