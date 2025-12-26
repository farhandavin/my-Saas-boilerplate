// backend/src/middleware/billingMiddleware.js
const billingService = require("../services/billingService");
const AppError = require("../utils/AppError");

const checkAiQuota = async (req, res, next) => {
  try {
    const { teamId } = req.user; // Dari auth/tenant middleware
    
    // Estimasi biaya awal (misal: minimal butuh 50 token untuk start)
    const MINIMUM_COST = 50; 

    const hasQuota = await billingService.checkQuota(teamId, MINIMUM_COST);

    if (!hasQuota) {
      return next(new AppError("Kuota AI habis. Silakan upgrade paket Anda.", 402)); // 402 = Payment Required
    }

    next();
  } catch (error) {
    console.error("Billing Middleware Error:", error);
    next(new AppError("Gagal memverifikasi kuota billing.", 500));
  }
};

module.exports = checkAiQuota;