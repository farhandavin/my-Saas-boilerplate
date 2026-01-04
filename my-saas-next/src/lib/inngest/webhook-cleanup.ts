/**
 * Webhook Delivery Cleanup
 * 
 * Cleans up old webhook delivery records to prevent unbounded table growth.
 * Runs weekly and removes records older than 90 days.
 */
import { inngest } from "./client";
import { db } from "@/db";
import { webhookDeliveries, auditLogs } from "@/db/schema";
import { lt, sql } from "drizzle-orm";

const RETENTION_DAYS = 90;

export const webhookDeliveryCleanup = inngest.createFunction(
    {
        id: "webhook-delivery-cleanup",
        retries: 3,
    },
    { cron: "0 3 * * 0" }, // Every Sunday at 3 AM
    async ({ step }) => {
        const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

        // Step 1: Delete old webhook deliveries
        const webhookResult = await step.run("cleanup-webhook-deliveries", async () => {
            const result = await db.delete(webhookDeliveries)
                .where(lt(webhookDeliveries.deliveredAt, cutoffDate));
            return { deletedCount: (result as unknown as { rowCount?: number }).rowCount ?? 0 };
        });

        // Step 2: Delete old audit logs (optional - keep for 1 year)
        const auditCutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        const auditResult = await step.run("cleanup-old-audit-logs", async () => {
            const result = await db.delete(auditLogs)
                .where(lt(auditLogs.createdAt, auditCutoff));
            return { deletedCount: (result as unknown as { rowCount?: number }).rowCount ?? 0 };
        });

        return {
            webhookDeliveries: webhookResult.deletedCount,
            auditLogs: auditResult.deletedCount,
            cutoffDate: cutoffDate.toISOString(),
            auditCutoffDate: auditCutoff.toISOString(),
        };
    }
);
