/**
 * Audit Log Cleanup Cron
 * 
 * Runs daily to delete audit logs older than 90 days.
 * This prevents unbounded database growth.
 */
import { inngest } from "./client";
import { db } from "@/db";
import { auditLogs, systemLogs } from "@/db/schema";
import { lt, sql } from "drizzle-orm";

const RETENTION_DAYS = 90;

export const auditLogCleanup = inngest.createFunction(
    {
        id: "audit-log-cleanup",
        retries: 2,
    },
    // Run daily at 3:00 AM UTC
    { cron: "0 3 * * *" },
    async ({ step }) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

        // Step 1: Count logs to be deleted (for reporting)
        const countResult = await step.run("count-old-logs", async () => {
            const result = await db
                .select({ count: sql<number>`count(*)` })
                .from(auditLogs)
                .where(lt(auditLogs.createdAt, cutoffDate));
            return result[0]?.count || 0;
        });

        // Step 2: Delete old audit logs
        const deletedAuditLogs = await step.run("delete-audit-logs", async () => {
            const result = await db
                .delete(auditLogs)
                .where(lt(auditLogs.createdAt, cutoffDate))
                .returning({ id: auditLogs.id });
            return result.length;
        });

        // Step 3: Delete old system logs (same retention)
        const deletedSystemLogs = await step.run("delete-system-logs", async () => {
            const result = await db
                .delete(systemLogs)
                .where(lt(systemLogs.createdAt, cutoffDate))
                .returning({ id: systemLogs.id });
            return result.length;
        });

        // Step 4: Log the cleanup operation
        await step.run("log-cleanup", async () => {
            await db.insert(systemLogs).values({
                level: "INFO",
                source: "CRON",
                message: `Audit log cleanup completed: ${deletedAuditLogs} audit logs and ${deletedSystemLogs} system logs deleted`,
                metadata: {
                    retentionDays: RETENTION_DAYS,
                    cutoffDate: cutoffDate.toISOString(),
                    deletedAuditLogs,
                    deletedSystemLogs,
                },
            });
        });

        return {
            success: true,
            deletedAuditLogs,
            deletedSystemLogs,
            cutoffDate: cutoffDate.toISOString(),
        };
    }
);
