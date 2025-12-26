// file: backend/src/middleware/tenantMiddleware.js
const prisma = require("../config/prismaClient");

const requireTenant = async (req, res, next) => {
  try {
    // 1. Pastikan Auth Middleware sudah jalan duluan (req.user harus ada)
    if (!req.user || !req.user.teamId) {
      return res.status(401).json({ error: "No Tenant Context found" });
    }

    // 2. Validasi apakah user benar-benar member aktif di tim ini
    // (Security Check: Mencegah user memalsukan token teamId)
    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.user.userId,
          teamId: req.user.teamId,
        },
      },
      include: { team: true },
    });

    if (!membership) {
      return res.status(403).json({ error: "Access denied to this organization" });
    }

    // 3. Attach Tenant Context ke Request
    // Di sinilah "Database Router" nanti bekerja. 
    // Untuk sekarang (Phase 1), kita pakai Shared DB tapi simpan info Tiernya.
    req.tenant = membership.team;
    req.userRole = membership.role; // Shortcut untuk cek role di controller nanti

    console.log(`[Tenant Access] ${req.tenant.name} (${req.tenant.tier}) accessed by ${req.userRole}`);
    
    next();
  } catch (error) {
    console.error("Tenant Middleware Error:", error);
    res.status(500).json({ error: "Internal Server Error during Tenant Resolution" });
  }
};

module.exports = requireTenant;