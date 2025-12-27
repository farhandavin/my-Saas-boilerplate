const { PrismaClient } = require('@prisma/client');
const sharedPrisma = require('../config/prismaClient'); // Menggunakan client utama

// Fungsi ini mensimulasikan provisioning DB baru
// Di production, ini akan memanggil API provider DB (misal AWS RDS / Neon API)
const provisionNewDatabase = async (teamId) => {
  // CONTOH: Kita generate URL dummy atau ambil dari env pool
  // Real implementation: Call API -> Wait -> Get Connection String
  console.log(`🏗️ Provisioning database baru untuk Team ${teamId}...`);
  return process.env.DEDICATED_DB_POOL_URL || process.env.DATABASE_URL; // Fallback ke DB sama untuk tes
};

exports.startMigrationJob = async (teamId) => {
  console.log(`🚀 [JOB] Memulai migrasi background untuk Team: ${teamId}`);

  try {
    // 1. Set Status: IN_PROGRESS
    await sharedPrisma.team.update({
      where: { id: teamId },
      data: { migrationStatus: 'IN_PROGRESS' }
    });

    // 2. Provisioning Database (Simulasi)
    const targetDbUrl = await provisionNewDatabase(teamId);

    // 3. Setup Koneksi Target
    const targetPrisma = new PrismaClient({
      datasources: { db: { url: targetDbUrl } },
    });

    // 4. Extract Data (Dari Shared DB)
    const teamData = await sharedPrisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        auditLogs: true,
        // documents: true, // Uncomment jika model Document sudah ada
      }
    });

    // 5. Load Data (Ke Dedicated DB)
    await targetPrisma.$transaction(async (tx) => {
      // Bersihkan data lama di target (Idempotency) agar tidak duplikat
      // Create Team Header
      const { members, auditLogs, ...teamFields } = teamData;
      
      // Upsert Team di DB Target
      await tx.team.upsert({
        where: { id: teamId },
        update: {},
        create: {
          ...teamFields,
          tier: 'ENTERPRISE',
          databaseUrl: targetDbUrl,
          migrationStatus: 'COMPLETED'
        }
      });

      // Pindahkan Member
      if (members.length > 0) {
        // Hapus dulu untuk menghindari error unique constraint jika retry
        await tx.teamMember.deleteMany({ where: { teamId } }); 
        await tx.teamMember.createMany({ data: members });
      }

      // Pindahkan Logs
      if (auditLogs.length > 0) {
        await tx.auditLog.deleteMany({ where: { teamId } });
        await tx.auditLog.createMany({ data: auditLogs });
      }
    });

    // 6. Update Pointer di Shared DB (Router)
    await sharedPrisma.team.update({
      where: { id: teamId },
      data: {
        tier: 'ENTERPRISE',
        databaseUrl: targetDbUrl, // Router akan melihat ini
        migrationStatus: 'COMPLETED'
      }
    });

    console.log(`✅ [JOB] Migrasi Selesai untuk Team ${teamId}`);
    
    // Cleanup connection
    await targetPrisma.$disconnect();

  } catch (error) {
    console.error(`❌ [JOB] Migrasi Gagal:`, error);
    // Revert status agar admin tahu
    await sharedPrisma.team.update({
      where: { id: teamId },
      data: { migrationStatus: 'FAILED' }
    });
  }
};