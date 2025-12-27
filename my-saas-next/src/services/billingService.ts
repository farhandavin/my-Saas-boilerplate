// backend/src/services/billingService.js
const prisma = require("../config/prismaClient");

class BillingService {
  /**
   * Cek apakah Team punya cukup token.
   * @param {String} teamId 
   * @param {Number} estimatedCost - Estimasi biaya token (default 0)
   */
  async checkQuota(teamId, estimatedCost = 0) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { aiUsageCount: true, aiTokenLimit: true, tier: true }
    });

    if (!team) throw new Error("Team not found");

    // Enterprise biasanya Unlimited, tapi kita tetap track usage
    if (team.tier === 'ENTERPRISE') return true;

    const remaining = team.aiTokenLimit - team.aiUsageCount;
    
    // Jika sisa kurang dari estimasi biaya, tolak.
    if (remaining < estimatedCost) {
      return false;
    }

    return true;
  }

  /**
   * Potong kuota token Team.
   * @param {String} teamId 
   * @param {Number} amount - Jumlah token yang dipakai
   */
  async deductToken(teamId, amount) {
    // Kita gunakan Atomic Increment dari Prisma
    // Ini mencegah "Race Condition" jika 2 user satu tim klik tombol barengan
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        aiUsageCount: {
          increment: amount
        }
      },
      select: { aiUsageCount: true, aiTokenLimit: true }
    });

    console.log(`[BILLING] Deducted ${amount} tokens from Team ${teamId}. Usage: ${updatedTeam.aiUsageCount}/${updatedTeam.aiTokenLimit}`);
    return updatedTeam;
  }
  
  /**
   * Hitung biaya token berdasarkan input + output (Simulasi OpenAI)
   * 1 Token ~= 4 Characters
   */
  calculateCost(inputText, outputText) {
    const inputTokens = Math.ceil(inputText.length / 4);
    const outputTokens = Math.ceil(outputText.length / 4);
    return inputTokens + outputTokens;
  }
}

module.exports = new BillingService();