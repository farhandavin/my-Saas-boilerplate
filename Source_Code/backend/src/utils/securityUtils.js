// src/utils/securityUtils.js

// Pola Regex sederhana untuk data sensitif Indonesia/Global
const PII_PATTERNS = {
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  PHONE: /(\+62|62|0)8[1-9][0-9]{6,9}/g, // Format HP Indonesia
  NIK: /\b\d{16}\b/g, // NIK KTP (16 digit angka)
  CURRENCY: /Rp\s?[\d,.]+/g // Deteksi nominal Rupiah
};

exports.maskPII = (text) => {
  let maskedText = text;
  
  maskedText = maskedText.replace(PII_PATTERNS.EMAIL, '[EMAIL_REDACTED]');
  maskedText = maskedText.replace(PII_PATTERNS.PHONE, '[PHONE_REDACTED]');
  maskedText = maskedText.replace(PII_PATTERNS.NIK, '[ID_REDACTED]');
  // Opsional: Sensor gaji/uang untuk privasi keuangan
  // maskedText = maskedText.replace(PII_PATTERNS.CURRENCY, '[MONEY_REDACTED]');
  
  return maskedText;
};

// Fungsi helper untuk mencatat Audit Log
const prisma = require("../config/prismaClient");

exports.createAuditLog = async (teamId, userId, action, details, req) => {
  try {
    await prisma.auditLog.create({
      data: {
        teamId,
        userId,
        action,
        details: JSON.stringify(details),
        ipAddress: req.ip || req.connection.remoteAddress
      }
    });
  } catch (err) {
    console.error("Audit Log Error:", err);
    // Jangan crash aplikasi cuma karena gagal log
  }
};