// file: backend/src/services/authService.js
const prisma = require("../config/prismaClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class AuthService {
  // Register dengan Logic "Auto-create Team"
  async registerUser({ name, email, password, companyName }) {
    // 1. Validasi
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("Email is already registered");

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalCompanyName = companyName || `${name}'s Organization`;
    const teamSlug = finalCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

    // 2. Transaction: User User + Team + TeamMember (Owner) harus sukses bersamaan
    // Ini atomic operation.
    return await prisma.$transaction(async (tx) => {
      // Buat User
      const user = await tx.user.create({
        data: { name, email, password: hashedPassword },
      });

      // Buat Team (Tenant) dengan Tier FREE
      const team = await tx.team.create({
        data: {
          name: finalCompanyName,
          slug: teamSlug,
          tier: "FREE",
          aiTokenLimit: 500, // Limit starter
        },
      });

      // Hubungkan User sebagai OWNER Team tersebut
      await tx.teamMember.create({
        data: {
          userId: user.id,
          teamId: team.id,
          role: "OWNER",
        },
      });

      // Catat Audit Log pertama (Registration)
      await tx.auditLog.create({
        data: {
          teamId: team.id,
          userId: user.id,
          action: "ORG_CREATED",
          details: `Organization ${finalCompanyName} created by ${email}`,
        },
      });

      return { user, team };
    });
  }

  async loginUser({ email, password }) {
    // 1. Cari User & Team yang dia miliki
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        teamMembers: {
          include: { team: true }, // Include detail Team & Tier
        },
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }

    // 2. Tentukan Active Team (Default: Tim pertama yang ditemukan)
    // Di masa depan, user bisa switch team jika dia diundang ke banyak tim
    const activeMembership = user.teamMembers[0]; 
    if (!activeMembership) throw new Error("User does not belong to any team");

    const activeTeam = activeMembership.team;

    // 3. Generate Token dengan "RBAC & Context Payload"
    // Token ini membawa informasi Role & Tier, jadi Frontend tau hak aksesnya.
    const token = jwt.sign(
      {
        userId: user.id,
        teamId: activeTeam.id,
        role: activeMembership.role, // OWNER, ADMIN, MEMBER
        tier: activeTeam.tier,       // FREE, PRO, ENTERPRISE
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return { user, token, team: activeTeam, role: activeMembership.role };
  }
}

module.exports = new AuthService();