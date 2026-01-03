
// src/services/authService.ts
import { db } from '@/db';
import { users, teams, teamMembers, invitations, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { Role } from '@/types';

export const AuthService = {
  /**
   * Register sebagai ADMIN - membuat user baru dan team baru
   */
  async register(data: { name: string; email: string; password: string; companyName: string; role?: Role }) {
    const { name, email, password, companyName } = data;

    // 1. Cek Email
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    
    if (existingUser) throw new Error("Email sudah terdaftar");

    const hashedPassword = await bcrypt.hash(password, 10);
    const teamSlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

    // 2. Transaksi: User + Team + Member (Owner)
    const result = await db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values({
        name, 
        email, 
        password: hashedPassword 
      }).returning();

      const [team] = await tx.insert(teams).values({
        name: companyName,
        slug: teamSlug,
        tier: "FREE",
        aiTokenLimit: 500, // Starter quota
      }).returning();

      await tx.insert(teamMembers).values({
        userId: user.id,
        teamId: team.id,
        role: "ADMIN" as Role,
      });

      // Audit Log Awal
      await tx.insert(auditLogs).values({
        teamId: team.id,
        userId: user.id,
        action: "ORG_CREATED",
        entity: "Team",
        details: `Organization ${companyName} created`,
      });

      return { user, team };
    });

    return result;
  },

  /**
   * Register sebagai MANAGER/STAFF - via invitation code
   * User baru yang langsung bergabung ke tim yang sudah ada
   */
  async registerWithInvite(data: { name: string; email: string; password: string; inviteCode: string }) {
    const { name, email, password, inviteCode } = data;

    // 1. Find invitation
    const invitation = await db.query.invitations.findFirst({
      where: eq(invitations.token, inviteCode),
      with: { team: true }
    });

    if (!invitation || !invitation.team) throw new Error("Kode undangan tidak valid");
    // Check expiry (assuming expires is Date)
    if (new Date(invitation.expires) < new Date()) throw new Error("Kode undangan sudah kadaluarsa");
    if (invitation.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error("Email tidak sesuai dengan undangan");
    }

    // 2. Cek email tidak duplicate
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    
    if (existingUser) throw new Error("Email sudah terdaftar. Silakan login lalu terima undangan.");

    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Transaksi: User + TeamMember + delete invitation
    const result = await db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values({
        name, 
        email, 
        password: hashedPassword 
      }).returning();

      await tx.insert(teamMembers).values({
        userId: user.id,
        teamId: invitation.teamId,
        role: invitation.role as Role,
      });

      // Delete invitation (used)
      await tx.delete(invitations).where(eq(invitations.id, invitation.id));

      // Audit Log
      await tx.insert(auditLogs).values({
        teamId: invitation.teamId,
        userId: user.id,
        action: "MEMBER_JOINED",
        entity: "Team",
        details: `${name} joined via invitation as ${invitation.role}`,
      });

      return { 
        user, 
        team: invitation.team as any,
        role: invitation.role
      };
    });


    return result;
  },

  async updateUser(userId: string, data: { name?: string; image?: string }) {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }
};
