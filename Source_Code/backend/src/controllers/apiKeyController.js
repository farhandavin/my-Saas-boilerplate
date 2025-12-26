// backend/src/controllers/apiKeyController.js
const apiKeyService = require("../services/apiKeyService");
const prisma = require("../config/prismaClient");
const catchAsync = require("../utils/catchAsync");
const AuditLogService = require("../services/auditLogService");

// Buat API Key Baru
exports.create = catchAsync(async (req, res) => {
  const { name } = req.body;
  const { teamId, userId } = req.user;

  const result = await apiKeyService.createKey(teamId, name || "General Key");

  // Log Aktivitas
  AuditLogService.log({
    teamId,
    userId,
    action: "API_KEY_CREATED",
    details: `Created key: ${name}`
  });

  res.status(201).json({
    success: true,
    data: {
      id: result.id,
      name: result.name,
      prefix: result.prefix,
      // PENTING: Ini satu-satunya saat kita kirim Secret Key
      secretKey: result.secretKey 
    }
  });
});

// List semua API Key milik Team
exports.list = catchAsync(async (req, res) => {
  const { teamId } = req.user;

  const keys = await prisma.apiKey.findMany({
    where: { teamId },
    select: {
      id: true,
      name: true,
      prefix: true,
      lastUsedAt: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ success: true, data: keys });
});

// Revoke / Hapus Key
exports.revoke = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { teamId, userId } = req.user;

  // Pastikan key milik tim user ini
  await prisma.apiKey.deleteMany({
    where: { 
      id: id,
      teamId: teamId 
    }
  });

  AuditLogService.log({
    teamId,
    userId,
    action: "API_KEY_REVOKED",
    details: `Revoked key ID: ${id}`
  });

  res.json({ success: true, message: "API Key revoked successfully" });
});