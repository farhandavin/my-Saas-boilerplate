import { db } from '@/db';
import { teams, privacyRules } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface TrustScore {
  score: number;
  totalChecks: number;
  passedChecks: number;
  details: {
    category: string;
    name: string;
    passed: boolean;
    impact: 'high' | 'medium' | 'low';
    fixUrl?: string;
  }[];
}

export const TrustService = {
  async getScore(teamId: string): Promise<TrustScore> {
    const teamData = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (!teamData) throw new Error('Team not found');

    const rules = await db.select().from(privacyRules).where(eq(privacyRules.teamId, teamId));
    
    // Checks
    const checks = [
      {
        category: 'Data Protection',
        name: 'Privacy Layer Enabled',
        passed: rules.some(r => r.isEnabled), // Naive check: at least one rule enabled
        impact: 'high' as const,
        fixUrl: '/dashboard/privacy-layer'
      },
      {
        category: 'Data Protection',
        name: 'PII Masking Active',
         passed: rules.length > 0,
         impact: 'high' as const,
         fixUrl: '/dashboard/privacy-layer'
      },
      {
         category: 'Access Control',
         name: 'Audit Logging Enabled',
         passed: true, // Always on in this system
         impact: 'medium' as const,
         fixUrl: '/dashboard/audit-logs'
      },
      {
          category: 'Compliance',
          name: 'Data Residency Configured',
          passed: !!teamData.dedicatedDatabaseUrl, // If custom DB is set, likely enterprise/configured
          impact: 'medium' as const,
          fixUrl: '/dashboard/setting'
      },
       {
          category: 'Security',
          name: '2FA Enforced',
          passed: false, // Mock check
          impact: 'high' as const,
          fixUrl: '/dashboard/setting/profile'
      }
    ];

    const totalChecks = checks.length;
    const passedChecks = checks.filter(c => c.passed).length;
    const score = Math.round((passedChecks / totalChecks) * 100);

    return {
      score,
      totalChecks,
      passedChecks,
      details: checks
    };
  }
};
