const { PrismaClient } = require('@prisma/client');

// Shared Database Client (untuk Tier Free/Pro)
const sharedPrisma = new PrismaClient();

// Cache untuk koneksi tenant (Tier Enterprise) agar tidak membuat koneksi baru terus menerus
const tenantClients = new Map();

/**
 * DATABASE ROUTER LOGIC
 * Memilih koneksi DB berdasarkan Tim.
 * - Free/Pro: Menggunakan Shared Database (public schema).
 * - Enterprise: Bisa menggunakan Dedicated Database URL.
 */
const getPrismaClientForTeam = async (teamId) => {
  // 1. Ambil info tim dari Shared DB dulu untuk cek konfigurasi
  const team = await sharedPrisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, tier: true, databaseUrl: true }
  });

  if (!team) throw new Error("Team not found");

  // 2. Logic Routing
  if (team.tier === 'ENTERPRISE' && team.databaseUrl) {
    // Cek apakah koneksi sudah ada di cache
    if (tenantClients.has(team.id)) {
      return tenantClients.get(team.id);
    }

    // Jika belum, buat koneksi baru ke DB khusus mereka
    const tenantClient = new PrismaClient({
      datasources: {
        db: {
          url: team.databaseUrl,
        },
      },
    });

    tenantClients.set(team.id, tenantClient);
    return tenantClient;
  }

  // Default: Kembalikan Shared Client
  return sharedPrisma;
};

module.exports = { sharedPrisma, getPrismaClientForTeam };