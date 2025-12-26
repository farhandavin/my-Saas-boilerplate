// backend/src/middleware/rbacMiddleware.js
const AppError = require("../utils/AppError");

/**
 * Middleware untuk membatasi akses berdasarkan Role.
 * @param  {...String} allowedRoles - Daftar role yang diizinkan (misal: 'OWNER', 'ADMIN')
 */
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Pastikan user sudah login & punya konteks role (dari tenantMiddleware/authMiddleware)
    // req.userRole diset oleh tenantMiddleware
    // req.user.role diset oleh authMiddleware (fallback)
    const userRole = req.userRole || req.user?.role;

    if (!userRole) {
      return next(new AppError("You are not logged in or role is missing.", 401));
    }

    // 2. Cek apakah role user ada dalam daftar yang diizinkan
    if (!allowedRoles.includes(userRole)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }

    // 3. Lanjut
    next();
  };
};

module.exports = { restrictTo };