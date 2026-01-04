// src/app/api/ai/ceo-digest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withTeam } from '@/lib/middleware/auth';
import { CEODigestService } from '@/services/ceoDigestService';
import { getErrorMessage } from '@/lib/error-utils';


// GET - Generate CEO Digest (ADMIN only)
export const GET = withTeam(
  async (req: NextRequest, context: any) => {
    const { user, team } = context;

    // Only ADMIN can access CEO Digest
    if (team?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'CEO Digest hanya untuk Owner' },
        { status: 403 }
      );
    }

    try {
      const digest = await CEODigestService.generateDigest(team.teamId);

      return NextResponse.json({
        success: true,
        data: digest
      });
    } catch (error: unknown) {
      console.error('CEO Digest error:', error);

      const errorMessage = error instanceof Error ? getErrorMessage(error) : 'Unknown error';
      const errorObj = error as { statusCode?: number; lastError?: { statusCode?: number } };

      // Check if it's a quota exceeded error (429)
      const isQuotaError = errorObj?.statusCode === 429 ||
        errorObj?.lastError?.statusCode === 429 ||
        errorMessage?.includes('quota') ||
        errorMessage?.includes('RESOURCE_EXHAUSTED');

      if (isQuotaError) {
        // Return a graceful fallback digest
        return NextResponse.json({
          success: true,
          data: getFallbackDigest(),
          isCache: true,
          message: 'AI quota exceeded. Showing cached summary. Try again later.'
        });
      }

      return NextResponse.json(
        { error: errorMessage || 'Gagal generate CEO Digest' },
        { status: 500 }
      );
    }
  },
  { roles: ['ADMIN'] }
);

// Fallback digest when AI quota is exceeded
function getFallbackDigest() {
  const today = new Date();
  return {
    generatedAt: today.toISOString(),
    briefingMessage: `CEO Daily Briefing - ${today.toLocaleDateString()}\n\n⚠️ AI Generation Temporarily Paused\n\nThe AI quota has been exceeded. Real-time analysis will resume when quota resets. In the meantime, please review your dashboards manually.`,
    financial: {
      revenue: { yesterdayTotal: 0, dailyTarget: 100000000, achievementPercent: 0 },
      usage: { aiTokensUsed: 0, tokenLimit: 10000, percentUsed: 0 }
    },
    operational: {
      teamStats: { totalMembers: 0, activeToday: 0 },
      customerHealth: { openTickets: 0, avgResponseTime: 0 }
    },
    productivity: {
      strategicProjects: [],
      salesPipeline: { totalLeads: 0, qualifiedLeads: 0, conversionRate: '0%' }
    },
    risks: {
      anomalies: [{ affectedArea: 'AI Service', severity: 'Low', description: 'Quota temporarily exceeded' }],
      recommendations: ['Wait for quota reset', 'Consider upgrading Gemini API plan']
    }
  };
}

// POST - Generate custom digest with date range (ADMIN only)
export const POST = withTeam(
  async (req: NextRequest, context: any) => {
    const { team } = context;

    if (team?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'CEO Digest hanya untuk Owner' },
        { status: 403 }
      );
    }

    try {
      const body = await req.json();
      const { dateFrom, dateTo } = body;

      // For now, use standard digest
      // TODO: Implement date range filtering
      const digest = await CEODigestService.generateDigest(team.teamId);

      return NextResponse.json({
        success: true,
        data: digest,
        period: { from: dateFrom, to: dateTo }
      });
    } catch (error: unknown) {
      console.error('CEO Digest error:', error);
      const errorMessage = error instanceof Error ? getErrorMessage(error) : 'Gagal generate CEO Digest';
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  },
  { roles: ['ADMIN'] }
);
