
// src/services/complianceService.ts
import { db } from '@/db';
import { users, auditLogs, teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const ComplianceService = {
  /**
   * EXPORT DATA: Gather all info related to a user
   */
  async exportUserData(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: { 
        teamMembers: { 
           with: { team: true } 
        } 
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const logs = await db.query.auditLogs.findMany({
       where: eq(auditLogs.userId, userId)
    });

    const exportData = {
      generatedAt: new Date(),
      profile: {
        name: user.name,
        email: user.email,

      },
      teams: user.teamMembers
        .filter(tm => tm.team)
        .map(tm => ({
          role: tm.role,
          teamName: tm.team!.name,
          tier: tm.team!.tier
        })),
      activityHistory: logs
    };

    return exportData;
  },

  /**
   * DELETE ACCOUNT: "Right to be Forgotten"
   */
  async deleteAccount(userId: string) {
    return await db.transaction(async (tx) => {
      await tx.delete(teamMembers).where(eq(teamMembers.userId, userId));
      
      await tx.update(auditLogs)
        .set({ userId: null, details: "User requested deletion (GDPR)" })
        .where(eq(auditLogs.userId, userId));

      const [deletedUser] = await tx.delete(users)
        .where(eq(users.id, userId))
        .returning();
      
      return deletedUser;
    });
  }
};