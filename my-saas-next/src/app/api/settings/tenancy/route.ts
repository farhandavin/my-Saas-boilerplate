// src/app/api/settings/tenancy/route.ts
// API for configuring hybrid multi-tenancy (Enterprise only)

import { NextRequest, NextResponse } from 'next/server';
import { withTeam } from '@/lib/middleware/auth';
import { TenantDatabaseService } from '@/services/tenantDatabaseService';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';

// GET /api/settings/tenancy - Get current tenancy configuration
export const GET = withTeam(async (req, context: any) => {
  const { team, user } = context;
  try {
    if (!team) return NextResponse.json({ error: 'Team context required' }, { status: 403 });
    const tenancyInfo = await TenantDatabaseService.getTenancyInfo(team.teamId);

    if (!tenancyInfo) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ...tenancyInfo,
      isEnterprise: tenancyInfo.tier === 'ENTERPRISE'
    });
  } catch (error) {
    console.error('[Tenancy API] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tenancy info' }, { status: 500 });
  }
}, { roles: ['ADMIN', 'MANAGER'] });

// POST /api/settings/tenancy - Configure dedicated database (Enterprise only)
export const POST = withTeam(async (req, context: any) => {
  const { team, user } = context;
  try {
    if (!team) return NextResponse.json({ error: 'Team context required' }, { status: 403 });
    // Check tier
    const tenancyInfo = await TenantDatabaseService.getTenancyInfo(team.teamId);

    if (tenancyInfo?.tier !== 'ENTERPRISE') {
      return NextResponse.json({
        error: 'Dedicated database is only available for Enterprise tier'
      }, { status: 403 });
    }

    const { databaseUrl, action } = await req.json();

    // Handle revert to shared
    if (action === 'revert') {
      await TenantDatabaseService.revertToShared(team.teamId);

      await db.insert(auditLogs).values({
        teamId: team.teamId,
        userId: user.userId,
        action: 'tenancy.reverted',
        entity: 'settings',
        details: 'Reverted to shared database'
      });

      return NextResponse.json({
        success: true,
        message: 'Reverted to shared database'
      });
    }

    // Configure dedicated database
    if (!databaseUrl) {
      return NextResponse.json({
        error: 'Database URL is required'
      }, { status: 400 });
    }

    // Validate URL format
    if (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://')) {
      return NextResponse.json({
        error: 'Invalid database URL format. Must be PostgreSQL connection string.'
      }, { status: 400 });
    }

    await TenantDatabaseService.configureDedicatedDatabase(team.teamId, databaseUrl);

    await db.insert(auditLogs).values({
      teamId: team.teamId,
      userId: user.userId,
      action: 'tenancy.configured',
      entity: 'settings',
      details: 'Configured dedicated database'
    });

    return NextResponse.json({
      success: true,
      message: 'Dedicated database configured successfully'
    });

  } catch (error: any) {
    console.error('[Tenancy API] POST error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to configure dedicated database'
    }, { status: 500 });
  }
}, { roles: ['ADMIN'] });
