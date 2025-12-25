// backend/scripts/migrateToEnterprise.js

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

// Client untuk Database Utama (Shared)
const sourcePrisma = new PrismaClient();

// Interface untuk input terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function migrateTeam(teamId, targetDatabaseUrl) {
  console.log(`\n🚀 Memulai Migrasi untuk Team ID: ${teamId}`);
  console.log(`➡️  Target Database: ${targetDatabaseUrl}`);

  // 1. CEK KONEKSI TARGET
  // Kita membuat client Prisma sementara yang terhubung ke DB baru
  const targetPrisma = new PrismaClient({
    datasources: {
      db: {
        url: targetDatabaseUrl,
      },
    },
  });

  try {
    // --- LANGKAH 1: EXTRACT (Ambil Data dari Shared DB) ---
    console.log('\n📦 [1/4] Mengambil data dari Shared Database...');
    const teamData = await sourcePrisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        documents: true,
        auditLogs: true,
        invitations: true,
      }
    });

    if (!teamData) {
      throw new Error("Tim tidak ditemukan di Shared Database!");
    }
    console.log(`   ✅ Data ditemukan: ${teamData.documents.length} Dokumen, ${teamData.auditLogs.length} Logs.`);

    // --- LANGKAH 2: LOAD (Masukkan ke Dedicated DB) ---
    console.log('\n🚚 [2/4] Memindahkan data ke Dedicated Database...');
    
    // Kita gunakan Transaction di target DB agar kalau gagal, tidak ada data setengah-setengah
    await targetPrisma.$transaction(async (tx) => {
      
      // A. Buat Record Team (Header)
      // Kita perlu exclude properti 'members', 'documents', dll dari object teamData 
      // karena Prisma create() butuh format nested write atau data bersih.
      const { members, documents, auditLogs, invitations, ...teamFields } = teamData;
      
      // Pastikan kita set tier dan databaseUrl di target juga (untuk konsistensi backup)
      await tx.team.create({
        data: {
          ...teamFields,
          tier: 'ENTERPRISE',
          databaseUrl: targetDatabaseUrl,
        }
      });

      // B. Migrasi Members
      if (members.length > 0) {
        await tx.teamMember.createMany({ data: members });
        console.log(`   - ${members.length} Members dipindahkan`);
      }

      // C. Migrasi Documents (PENTING: Embedding vector mungkin perlu penanganan khusus jika DB beda versi, tapi text aman)
      if (documents.length > 0) {
        await tx.document.createMany({ data: documents });
        console.log(`   - ${documents.length} Dokumen dipindahkan`);
      }

      // D. Migrasi Audit Logs
      if (auditLogs.length > 0) {
        await tx.auditLog.createMany({ data: auditLogs });
        console.log(`   - ${auditLogs.length} Audit Logs dipindahkan`);
      }

      // E. Migrasi Invitations
      if (invitations.length > 0) {
        await tx.invitation.createMany({ data: invitations });
        console.log(`   - ${invitations.length} Undangan dipindahkan`);
      }
    });
    console.log('   ✅ Data berhasil disalin ke Target DB.');

    // --- LANGKAH 3: UPDATE POINTER (Router Logic) ---
    console.log('\n🔗 [3/4] Mengupdate Routing di Shared Database...');
    await sourcePrisma.team.update({
      where: { id: teamId },
      data: {
        tier: 'ENTERPRISE',
        databaseUrl: targetDatabaseUrl
      }
    });
    console.log('   ✅ Router diperbarui. Traffic user sekarang akan diarahkan ke DB baru.');

    // --- LANGKAH 4: CLEANUP (Hapus Data Lama) ---
    console.log('\n🧹 [4/4] Membersihkan data lama di Shared Database (Opsional)...');
    const answer = await askQuestion('   ⚠️  Hapus data "anak" (Docs, Logs) di Shared DB untuk hemat space? (y/n): ');
    
    if (answer.toLowerCase() === 'y') {
      await sourcePrisma.$transaction([
        sourcePrisma.document.deleteMany({ where: { teamId } }),
        sourcePrisma.auditLog.deleteMany({ where: { teamId } }),
        sourcePrisma.invitation.deleteMany({ where: { teamId } }),
        // Member kadang tetap disimpan di shared untuk keperluan query User -> Teams, 
        // tapi jika arsitektur full terpisah, bisa dihapus. 
        // Di sini kita KEEP member agar user list di dashboard awal tetap cepat.
      ]);
      console.log('   ✅ Data lama dibersihkan.');
    } else {
      console.log('   ℹ️  Data lama dibiarkan (Soft Migration).');
    }

    console.log(`\n✨ MIGRASI SUKSES! Tim ${teamData.name} sekarang Enterprise.`);

  } catch (error) {
    console.error('\n❌ MIGRASI GAGAL:', error);
    console.log('   Tidak ada perubahan yang dilakukan pada Source DB (kecuali jika error terjadi di Step 4).');
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
    rl.close();
  }
}

// Menjalankan Script
async function main() {
  console.log("=== SAAS MIGRATION ENGINE (Shared -> Enterprise) ===");
  
  const teamId = await askQuestion("Masukkan Team ID yang akan dimigrasi: ");
  const targetDbUrl = await askQuestion("Masukkan Connection String Database Baru (Target): ");

  if (!teamId || !targetDbUrl) {
    console.log("Error: Data tidak lengkap.");
    process.exit(1);
  }

  await migrateTeam(teamId, targetDbUrl);
}

main();