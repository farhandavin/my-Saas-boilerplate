
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { auditLogs, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { withTeam } from '@/lib/middleware/auth';

export const GET = withTeam(
  async (req: NextRequest, context) => {
    const { user, team } = context;
    
    // Check if user has permission (ADMIN or MANAGER)
    if (!['ADMIN', 'MANAGER'].includes(team?.role || '')) {
      return NextResponse.json(
        { error: 'Not authorized to view audit logs' },
        { status: 403 }
      );
    }

    try {
      if (!team?.teamId) throw new Error("Team ID missing");

      // Drizzle Query
      const logs = await db.query.auditLogs.findMany({
        where: eq(auditLogs.teamId, team.teamId),
        with: {
            user: {
                columns: { id: true, name: true, email: true }
            }
        },
        orderBy: [desc(auditLogs.createdAt)],
        limit: 100
      });
      
      return NextResponse.json({ logs });
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audit logs' },
        { status: 500 }
      );
    }
  },
  { roles: ['ADMIN', 'MANAGER'] }
);
