// services/authService.js
const prisma = require("../config/prismaClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class AuthService {
  async registerUser({ name, email, password }) {
    console.log(`[DEBUG] Memulai proses registrasi untuk: ${email}`);
    
    // Gunakan Transaction: Jika satu gagal, semua batal (Clean & Safe)
    return await prisma.$transaction(async (tx) => {
      // 1. Cek user eksis
      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) throw new Error("Email sudah terdaftar");

      const hashedPassword = await bcrypt.hash(password, 10);

      // 2. Buat User & Team Baru (Pilar B2B: Setiap register punya lapak sendiri)
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          // Otomatis buat Team Default untuk user ini
          teamMembers: {
            create: {
              role: "OWNER",
              team: {
                create: {
                  name: `${name}'s Team`,
                  slug: `team-${Date.now()}`, // Logic slug sederhana
                  tier: "Free", // Default tier
                }
              }
            }
          }
        },
        include: {
          teamMembers: { include: { team: true } }
        }
      });

      console.log(`[DEBUG] User & Team berhasil dibuat: ${user.id}`);
      return user;
    });
  }

  async loginUser({ email, password }) {
    console.log(`[DEBUG] Mencoba login: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        teamMembers: {
          include: { team: true }
        }
      }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Kredensial salah");
    }

    // Ambil tim pertama sebagai default context (bisa dikembangkan untuk multi-team)
    const activeTeam = user.teamMembers[0];

    const token = jwt.sign(
      { 
        userId: user.id, 
        role: activeTeam.role, 
        teamId: activeTeam.teamId,
        tier: activeTeam.team.tier 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { user, token, activeTeam };
  }
}

module.exports = new AuthService();