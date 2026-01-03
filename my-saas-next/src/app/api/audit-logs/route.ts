import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/middleware/auth';
import { db } from '@/db';
import { auditLogs, users } from '@/db/schema';
import { eq, desc, and, or, ilike, sql, count } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const authResult = await getAuthUser(req);
    if (!authResult?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: Generic audit logs are sensitive. Only Admin/Manager should view them.
    // Staff should only see their own logs (if implemented), but for now we restrict strictly.
    const member = authResult.user.teamMembers.find((tm: any) => tm.teamId === authResult.teamId);
    if (!member || !member.role || !['ADMIN', 'MANAGER'].includes(member.role)) {
      return NextResponse.json({ error: 'Only Admins and Managers can view audit logs' }, { status: 403 });
    }

    const teamId = authResult.teamId;
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action') || '';

    // Build where conditions
    const conditions = [eq(auditLogs.teamId, teamId)];

    if (search) {
      conditions.push(
        or(
          ilike(auditLogs.action, `%${search}%`),
          ilike(auditLogs.entity, `%${search}%`),
          ilike(auditLogs.details, `%${search}%`)
        )!
      );
    }

    if (action) {
      conditions.push(eq(auditLogs.action, action));
    }

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(and(...conditions));

    const total = totalResult[0]?.count || 0;

    // Get logs with user info
    const logs = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entity: auditLogs.entity,
        details: auditLogs.details,
        ipAddress: auditLogs.ipAddress,
        createdAt: auditLogs.createdAt,
        userId: auditLogs.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    // Get stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    // Total count
    const statsTotalResult = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(eq(auditLogs.teamId, teamId));

    // Today's count (simple approach)
    const todayResult = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(and(eq(auditLogs.teamId, teamId), sql`${auditLogs.createdAt} >= ${todayIso}::timestamp`));

    const stats = {
      totalEvents: statsTotalResult[0]?.count || 0,
      todayEvents: todayResult[0]?.count || 0,
    };

    return NextResponse.json({
      success: true,
      logs,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error: any) {
    console.error('Audit logs fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new audit log entry (for internal use)
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthUser(req);
    if (!authResult?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, entity, details } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // Get IP address
    const forwarded = req.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 'unknown';

    const [newLog] = await db.insert(auditLogs).values({
      teamId: authResult.teamId,
      userId: authResult.userId,
      action,
      entity: entity || 'system',
      details,
      ipAddress,
    }).returning();

    return NextResponse.json({
      success: true,
      log: newLog,
    });

  } catch (error: any) {
    console.error('Audit log creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create audit log', details: error.message },
      { status: 500 }
    );
  }
}
