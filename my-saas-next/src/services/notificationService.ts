
// src/services/notificationService.ts
import { db } from '@/db';
import { notifications, teamMembers } from '@/db/schema';
import { eq, and, gt, inArray } from 'drizzle-orm';
// Fix: gte is not exported from drizzle-orm base, use generic operator logic or sql
import { sql } from 'drizzle-orm';

export const NotificationService = {
  /**
   * Send notification to a specific User
   */
  async send(userId: string, teamId: string, title: string, message: string, type: string = "INFO") {
    return await db.insert(notifications).values({
      userId, teamId, title, message, type
    });
  },

  /**
   * Send notification to all Owners & Admins in a Team (Broadcast)
   */
  async broadcastToAdmins(teamId: string, title: string, message: string, type: string = "INFO") {
    const admins = await db.query.teamMembers.findMany({
      where: and(
        eq(teamMembers.teamId, teamId),
        inArray(teamMembers.role, ['ADMIN', 'MANAGER'])
      )
    });

    const notificationsData = admins.map(admin => ({
      // id: crypto.randomUUID(), // Drizzle defaults usually handle random if defined, but schema.ts has $defaultFn
      userId: admin.userId!,
      teamId,
      title,
      message,
      type,
      isRead: false,
      // createdAt: new Date()
    }));

    if (notificationsData.length > 0) {
      await db.insert(notifications).values(notificationsData);
    }
  },

  /**
   * UPSELLING INTELLIGENCE LOGIC
   */
  async checkUpsellTrigger(teamId: string, currentUsage: number, maxLimit: number) {
    if (maxLimit === 0) return; // Avoid division by zero
    const percentage = (currentUsage / maxLimit) * 100;

    if (percentage >= 80) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingNotif = await db.query.notifications.findFirst({
        where: and(
          eq(notifications.teamId, teamId),
          eq(notifications.type, "UPSELL"),
          sql`${notifications.createdAt} >= ${today.toISOString()}`
        )
      });

      if (!existingNotif) {
        let title = "⚠️ Quota Warning";
        let msg = `Your token usage has reached ${percentage.toFixed(0)}%.`;

        if (percentage >= 90) {
          title = "🚨 Low Quota Alert!";
          msg = `Critical! Less than 10% quota remaining. Upgrade to Enterprise now.`;
        } else {
          msg += " Consider upgrading your plan.";
        }

        await this.broadcastToAdmins(teamId, title, msg, "UPSELL");
        console.log(`[UPSELL] Sent trigger to Team ${teamId} at ${percentage}% usage.`);
      }
    }
  }
};