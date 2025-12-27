// backend/src/services/auditLogService.js
const prisma = require("../config/prismaClient");

class AuditLogService {
  /**
   * Mencatat aktivitas user ke database AuditLog
   * @param {Object} params
   * @param {String} params.teamId - ID Tim/Tenant
   * @param {String} params.userId - Pelaku
   * @param {String} params.action - Nama aksi (huruf besar, snake_case)
   * @param {String} [params.resource] - ID objek yang dimodifikasi (opsional)
   * @param {String} [params.details] - Deskripsi detail (opsional)
   * @param {String} [params.ip] - IP Address user (opsional)
   */
  async log({ teamId, userId, action, resource, details, ip }) {
    try {
      // Kita tidak menggunakan 'await' di level controller agar tidak memblokir response time
      // Tapi di sini kita jalankan insert ke DB
      await prisma.auditLog.create({
        data: {
          teamId,
          userId,
          action,
          resource,
          details,
          ipAddress: ip || "0.0.0.0",
        },
      });
      console.log(`[AUDIT] ${action} by ${userId} in team ${teamId}`);
    } catch (error) {
      // Jika audit log gagal, jangan crash aplikasi, cukup error log di server
      console.error("❌ Failed to create audit log:", error);
    }
  }
}

module.exports = new AuditLogService();