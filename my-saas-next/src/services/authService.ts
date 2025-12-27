// src/services/authService.ts
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@/types';

export const AuthService = {
  async register(data: { name: string; email: string; password: string; companyName: string }) {
    const { name, email, password, companyName } = data;

    // 1. Cek Email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("Email sudah terdaftar");

    const hashedPassword = await bcrypt.hash(password, 10);
    const teamSlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

    // 2. Transaksi: User + Team + Member (Owner)
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, password: hashedPassword },
      });

      const team = await tx.team.create({
        data: {
          name: companyName,
          slug: teamSlug,
          tier: "FREE",
          aiTokenLimit: 500, // Starter quota
        },
      });

      await tx.teamMember.create({
        data: {
          userId: user.id,
          teamId: team.id,
          role: "OWNER" as Role,
        },
      });

      // Audit Log Awal
      await tx.auditLog.create({
        data: {
          teamId: team.id,
          userId: user.id,
          action: "ORG_CREATED",
          details: `Organization ${companyName} created`,
        }
      });

      return { user, team };
    });

    return result;
  }
};