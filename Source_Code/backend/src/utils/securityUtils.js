// src/utils/securityUtils.js
const prisma = require("../config/prismaClient");
// Pola Regex sederhana untuk data sensitif Indonesia/Global
const PII_PATTERNS = {
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  PHONE: /(\+62|62|0)8[1-9][0-9]{6,9}/g, // Format HP Indonesia
  NIK: /\b\d{16}\b/g, // NIK KTP (16 digit angka)
  CURRENCY: /Rp\s?[\d,.]+/g // Deteksi nominal Rupiah
};

/**
 * Privacy Layer: Masking Data Sensitif (PII)
 * Menghapus/Menyensor Email, No HP (+62), dan pola NIK.
 */
exports.maskPII = (text) => {
  if (!text) return "";

  // 1. Masking Email
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  let masked = text.replace(emailRegex, "[EMAIL REDACTED]");

  // 2. Masking No HP Indonesia (08xx atau +628xx)
  const phoneRegex = /(\+62|08)[0-9]{8,12}/g;
  masked = masked.replace(phoneRegex, "[PHONE REDACTED]");

  // 3. Masking Angka Panjang (Potensi NIK/KK - 16 digit)
  const nikRegex = /\b\d{16}\b/g;
  masked = masked.replace(nikRegex, "[NIK REDACTED]");

  return masked;
};

exports.createAuditLog = async (prisma, { teamId, userId, action, details, ipAddress }) => {
  return prisma.auditLog.create({
    data: {
      teamId,
      userId,
      action,
      details,
      ipAddress
    }
  });
};