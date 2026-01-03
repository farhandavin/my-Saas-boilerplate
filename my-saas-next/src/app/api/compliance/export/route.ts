
// src/app/api/compliance/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { db } from '@/db';
import { users, auditLogs, notifications } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/compliance/export - Export user data (GDPR compliant)
export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    // Collect all user data using Drizzle
    const user = await db.query.users.findFirst({
        where: eq(users.id, payload.userId),
        with: {
            teamMembers: {
                with: {
                    team: {
                         columns: { id: true, name: true, slug: true }
                    }
                }
            },
            // Note: relations to logs/notifications must be defined in schema relations
            // Assuming they are defined. If not, separate queries needed.
            // Let's assume standard One-to-Many relations exist.
        }
    });

    if (!user) return unauthorized('User not found');

    // Separate queries for large lists if not joined
    const userAuditLogs = await db.query.auditLogs.findMany({
        where: eq(auditLogs.userId, payload.userId),
        orderBy: [desc(auditLogs.createdAt)],
        limit: 100,
        columns: { action: true, details: true, createdAt: true }
    });

    const userNotifications = await db.query.notifications.findMany({
        where: eq(notifications.userId, payload.userId),
        orderBy: [desc(notifications.createdAt)],
        limit: 50,
        columns: { title: true, message: true, type: true, createdAt: true }
    });

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        ...user,
        // Drizzle User result
        teams: user.teamMembers.map(tm => ({
          ...tm.team,
          role: tm.role
        })),
        auditLogs: userAuditLogs,
        notifications: userNotifications
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Your data export is ready',
      data: exportData
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
