'use server';

import { db } from '@/db';
import { teams, usageBillings, documents, auditLogs } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function getAiStats(teamId: string) {
    if (!teamId) return null;

    try {
        // 1. Total AI Requests (from Team.aiUsageCount)
        const teamData = await db.query.teams.findFirst({
            where: eq(teams.id, teamId),
            columns: {
                aiUsageCount: true,
            },
        });

        // 2. Tokens Used (Sum from usage_billings)
        // Note: This relies on usage_billings being populated. If not, we might need a fallback or ensure backend tracks it.
        const tokenStats = await db
            .select({ totalTokens: sql<number>`sum(${usageBillings.tokensUsed})` })
            .from(usageBillings)
            .where(eq(usageBillings.teamId, teamId));

        // 3. Documents (Count)
        const docStats = await db
            .select({ count: sql<number>`count(*)` })
            .from(documents)
            .where(eq(documents.teamId, teamId));

        // 4. Issues (Count from active Warnings/Risks or Audit Logs)
        // For now, let's count Audit Logs flagged as 'critical' or just general logs as a proxy for activity if 'issues' aren't strictly tracked.
        // Or better: Count Notifications that are unread
        // The previous mock was 'Issues Detected' -> 23.
        // Let's use Audit Logs count for now as a proxy for "Events", or hardcode 0 if no issue tracker exists.
        // Actually, let's query 'audit_logs' for any 'failure' or 'error' action keywords?
        // Simpler: Just count total audit logs for "Activity" or keep it 0.
        // Let's count audit logs as "System Activities" which might include issues.
        // But to be precise to the UI "Issues Detected", maybe we look for 'risk' in precheck logs if we saved them?
        // Since we don't save precheck results to DB (only return them), we can't truly count "Issues Detected" from history.
        // I will mock "Issues Detected" as 0 for now (or random) unless I find a source.
        // Wait, `migrationJobs` has `errorMessage`.
        // Let's just return 0 for issues to be safe/honest.

        return {
            requests: teamData?.aiUsageCount || 0,
            tokens: tokenStats[0]?.totalTokens || 0,
            documents: docStats[0]?.count || 0,
            issues: 0 // Placeholder/Real (No dedicated 'issues' table found)
        };
    } catch (error) {
        console.error("Failed to fetch AI stats:", error);
        return { requests: 0, tokens: 0, documents: 0, issues: 0 };
    }
}
