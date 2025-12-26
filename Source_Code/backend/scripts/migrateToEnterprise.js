// backend/scripts/migrateToEnterprise.js
/**
 * 🚀 SEAMLESS MIGRATION ENGINE (Pilar 2 - Infrastructure)
 * * Script ini memindahkan data Tenant dari Shared DB -> Isolated DB.
 * Usage: node scripts/migrateToEnterprise.js <TEAM_ID> <NEW_DB_URL>
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const allTeams = await sourcePrisma.team.findMany({ select: { id: true } });
console.log("ID Tim yang tersedia di database sumber:", allTeams.map(t => t.id));
// 1. Koneksi ke Database Utama (Source)
const sourcePrisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("❌ Usage: node scripts/migrateToEnterprise.js <TEAM_ID> <NEW_DB_URL>");
    process.exit(1);
  }

  const [teamId, targetDbUrl] = args;

  console.log(`\n🚀 STARTING MIGRATION PROCESS`);
  console.log(`Target Team: ${teamId}`);
  console.log(`Target DB:   ${targetDbUrl.substring(0, 20)}...`);

  try {
    // ---------------------------------------------------------
    // STEP 1: VALIDASI & PERSIAPAN
    // ---------------------------------------------------------
    console.log(`\n[1/5] Validating Source Data...`);
    const team = await sourcePrisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: { include: { user: true } }, // Kita butuh data User juga
        documents: true,
        auditLogs: true,
        invitations: true
      }
    });

    if (!team) throw new Error("Team not found in Source DB");
    if (team.databaseUrl) throw new Error("Team already migrated (databaseUrl is set)");

    console.log(`✅ Found Team: ${team.name} (${team.members.length} members, ${team.documents.length} docs)`);

    // ---------------------------------------------------------
    // STEP 2: SCHEMA PUSH (Menyiapkan DB Baru)
    // ---------------------------------------------------------
    console.log(`\n[2/5] Initializing Target Database Schema...`);
    // Kita gunakan CLI Prisma untuk 'push' struktur schema ke DB baru
    try {
      execSync(`DATABASE_URL="${targetDbUrl}" npx prisma db push --skip-generate`, { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: targetDbUrl } 
      });
      console.log(`✅ Target Database Schema Ready.`);
    } catch (e) {
      throw new Error("Failed to push schema to target DB. Check connection string.");
    }

    // ---------------------------------------------------------
    // STEP 3: KONEKSI KE TARGET
    // ---------------------------------------------------------
    // Kita buat instance Prisma Client kedua khusus untuk DB Target
    const targetPrisma = new PrismaClient({
      datasources: {
        db: { url: targetDbUrl }
      }
    });

    // ---------------------------------------------------------
    // STEP 4: DATA MIGRATION (The Heavy Lifting)
    // ---------------------------------------------------------
    console.log(`\n[3/5] Migrating Data...`);

    // A. Migrate USERS (Global Entity)
    // Kita perlu menyalin User yang ada di tim ini ke DB baru 
    // agar Foreign Key (userId) tetap valid.
    console.log(`   -> Copying ${team.members.length} Users...`);
    for (const member of team.members) {
      // Gunakan upsert untuk menghindari error jika user sudah ada (misal dia member tim enterprise lain)
      await targetPrisma.user.upsert({
        where: { id: member.user.id },
        update: {}, // Jika ada, biarkan
        create: {
          id: member.user.id,
          email: member.user.email,
          name: member.user.name,
          image: member.user.image,
          password: member.user.password, // Password hash ikut dicopy
          createdAt: member.user.createdAt
        }
      });
    }

    // B. Migrate TEAM (The Tenant)
    console.log(`   -> Copying Team Profile...`);
    await targetPrisma.team.create({
      data: {
        id: team.id, // ID HARUS SAMA
        name: team.name,
        slug: team.slug,
        tier: "ENTERPRISE", // Auto upgrade tier di DB baru
        stripeCustomerId: team.stripeCustomerId,
        stripeSubscriptionId: team.stripeSubscriptionId,
        aiUsageCount: team.aiUsageCount,
        aiTokenLimit: 1000000, // Unlimited / High limit for Enterprise
        createdAt: team.createdAt,
        updatedAt: team.updatedAt
      }
    });

    // C. Migrate MEMBERS
    console.log(`   -> Copying Memberships...`);
    if (team.members.length > 0) {
      await targetPrisma.teamMember.createMany({
        data: team.members.map(m => ({
          id: m.id,
          userId: m.userId,
          teamId: m.teamId,
          role: m.role
        }))
      });
    }

    // D. Migrate DOCUMENTS (Pilar 1 Data)
    console.log(`   -> Copying ${team.documents.length} Documents...`);
    if (team.documents.length > 0) {
      // Vector embedding mungkin tidak bisa dicopy langsung jika formatnya raw
      // Untuk script dasar ini kita copy data text-nya saja
      await targetPrisma.document.createMany({
        data: team.documents.map(d => ({
          id: d.id,
          teamId: d.teamId,
          title: d.title,
          content: d.content,
          createdAt: d.createdAt
        }))
      });
    }

    // E. Migrate AUDIT LOGS (Compliance Data)
    console.log(`   -> Copying ${team.auditLogs.length} Audit Logs...`);
    if (team.auditLogs.length > 0) {
      await targetPrisma.auditLog.createMany({
        data: team.auditLogs.map(l => ({
          id: l.id,
          teamId: l.teamId,
          userId: l.userId,
          action: l.action,
          resource: l.resource,
          details: l.details,
          ipAddress: l.ipAddress,
          createdAt: l.createdAt
        }))
      });
    }

    // F. Migrate INVITATIONS
    console.log(`   -> Copying Pending Invitations...`);
    if (team.invitations.length > 0) {
      await targetPrisma.invitation.createMany({
        data: team.invitations.map(i => ({
          id: i.id,
          email: i.email,
          role: i.role,
          token: i.token,
          expires: i.expires,
          teamId: i.teamId
        }))
      });
    }

    console.log(`✅ Data Migration Complete.`);

    // ---------------------------------------------------------
    // STEP 5: FINALISASI (Switchover)
    // ---------------------------------------------------------
    console.log(`\n[4/5] Updating Router Logic in Source DB...`);
    
    // Update Source DB untuk menunjuk ke DB baru
    await sourcePrisma.team.update({
      where: { id: teamId },
      data: {
        tier: "ENTERPRISE",
        databaseUrl: targetDbUrl, // Router akan membaca ini nanti
        updatedAt: new Date()
      }
    });

    console.log(`\n[5/5] Cleanup (Optional)...`);
    // Opsional: Hapus data di shared DB agar hemat space.
    // Untuk keamanan, biasanya kita keep dulu atau soft-delete.
    console.log(`   -> Keeping old data in shared DB for backup purposes.`);

    console.log(`\n🎉 MIGRATION SUCCESS!`);
    console.log(`Team ${team.name} is now running on Isolated Database.`);
    
  } catch (error) {
    console.error("\n❌ MIGRATION FAILED:");
    console.error(error);
    process.exit(1);
  } finally {
    await sourcePrisma.$disconnect();
  }
}

main();