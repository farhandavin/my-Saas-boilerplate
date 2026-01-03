import { NextRequest, NextResponse } from 'next/server';
import { withTeam } from '@/lib/middleware/auth';
import { DashboardService } from '@/services/dashboardService';

export const GET = withTeam(
  async (req: NextRequest, context: any) => {
    const { team } = context;

    try {
      if (!team) return NextResponse.json({ error: 'Team context required' }, { status: 403 });

      // Parallel fetch for performance
      const [metrics, revenueTrend, recentActivity] = await Promise.all([
        DashboardService.getMetricStats(team.teamId),
        DashboardService.getRevenueTrend(team.teamId),
        DashboardService.getRecentActivity(team.teamId, 4) // Limit 4 for the card
      ]);

      return NextResponse.json({
        metrics,
        revenueTrend,
        recentActivity
      });
    } catch (error: any) {
      console.error('Dashboard Stats Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch dashboard stats' },
        { status: 500 }
      );
    }
  }
);
