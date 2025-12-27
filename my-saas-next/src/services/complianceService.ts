// backend/src/services/complianceService.js
const prisma = require("../config/prismaClient");
const archiver = require("archiver");

class ComplianceService {
  /**
   * EXPORT DATA: Gather all info related to a user
   */
  async exportUserData(userId) {
    // 1. Get Profile
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { teamMembers: { include: { team: true } } }
    });

    // 2. Get Audit Logs (Activity)
    const logs = await prisma.auditLog.findMany({ where: { userId } });

    // 3. Construct JSON
    const exportData = {
        generatedAt: new Date(),
        profile: {
            name: user.name,
            email: user.email,
            provider: user.provider
        },
        teams: user.teamMembers.map(tm => ({
            role: tm.role,
            teamName: tm.team.name,
            tier: tm.team.tier
        })),
        activityHistory: logs
    };

    return exportData;
  }

  /**
   * DELETE ACCOUNT: "Right to be Forgotten"
   * Warning: This is destructive.
   */
  async deleteAccount(userId) {
    // Use transaction to ensure complete cleanup
    return await prisma.$transaction(async (tx) => {
        // 1. Delete Team Memberships
        await tx.teamMember.deleteMany({ where: { userId } });
        
        // 2. Anonymize Audit Logs (Keep logs for security, but remove user link)
        await tx.auditLog.updateMany({
            where: { userId },
            data: { userId: "DELETED_USER", details: "User requested deletion (GDPR)" }
        });

        // 3. Delete User
        const deletedUser = await tx.user.delete({ where: { id: userId } });
        
        return deletedUser;
    });
  }
}

module.exports = new ComplianceService();