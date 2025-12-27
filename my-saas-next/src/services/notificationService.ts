// backend/src/services/notificationService.js
const prisma = require("../config/prismaClient");

class NotificationService {
  
  /**
   * Kirim notifikasi ke User tertentu
   */
  async send(userId, teamId, title, message, type = "INFO") {
    return await prisma.notification.create({
      data: { userId, teamId, title, message, type }
    });
  }

  /**
   * Kirim notifikasi ke semua Owner & Admin di Team (Broadcast)
   */
  async broadcastToAdmins(teamId, title, message, type = "INFO") {
    // Cari member yang role-nya OWNER atau ADMIN
    const admins = await prisma.teamMember.findMany({
      where: {
        teamId,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    });

    // Buat notifikasi untuk mereka semua (Bulk Insert)
    const notifications = admins.map(admin => ({
      id: crypto.randomUUID(), // Generate ID manual untuk createMany (jika DB support) atau loop
      userId: admin.userId,
      teamId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date()
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }
  }

  /**
   * LOGIKA UPSELLING INTELLIGENCE
   * Cek usage, jika > 80%, kirim notifikasi upsell (tapi jangan spamming)
   */
  async checkUpsellTrigger(teamId, currentUsage, maxLimit) {
    const percentage = (currentUsage / maxLimit) * 100;

    // Trigger pada 80%, 90%, dan 100%
    if (percentage >= 80) {
      // Cek apakah sudah ada notifikasi upsell hari ini agar tidak spam
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingNotif = await prisma.notification.findFirst({
        where: {
          teamId,
          type: "UPSELL",
          createdAt: { gte: today }
        }
      });

      if (!existingNotif) {
        let title = "⚠️ Peringatan Kuota";
        let msg = `Penggunaan token Anda mencapai ${percentage.toFixed(0)}%.`;
        
        if (percentage >= 90) {
          title = "🚨 Kuota Hampir Habis!";
          msg = `Bahaya! Sisa kuota < 10%. Upgrade ke Enterprise sekarang untuk *Unlimited Token* dan *Dedicated Support*.`;
        } else {
          msg += " Pertimbangkan upgrade paket agar operasional bisnis tidak terhenti.";
        }

        await this.broadcastToAdmins(teamId, title, msg, "UPSELL");
        console.log(`[UPSELL] Sent trigger to Team ${teamId} at ${percentage}% usage.`);
      }
    }
  }
}

module.exports = new NotificationService();