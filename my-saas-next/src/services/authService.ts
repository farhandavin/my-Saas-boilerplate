
// src/services/authService.ts
import { db } from '@/db';
import { users, teams, teamMembers, invitations, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { Role } from '@/types';
import { TokenService } from '@/services/tokenService';
import { EmailService } from '@/services/emailService';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Type for team from invitation relation
interface InvitationTeam {
  id: string;
  name: string;
  slug: string;
  tier: string | null;
}

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

  // ==================== SECURITY & 2FA ====================

  async requestEmailVerification(userId: string) {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) throw new Error("User not found");
    if (user.emailVerified) throw new Error("Email already verified");

    const token = await TokenService.generateToken(user.email);
    await EmailService.sendVerificationEmail(user.email, user.name || 'User', token);
    return true;
  },

  async confirmEmail(token: string) {
    // 1. Verify token
    const result = await TokenService.verifyToken(null as any, token); // We need a method to find by token ONLY? TokenService currently requires email.
    // Wait, TokenService.verifyToken requires email AND token.
    // We need logic to find token -> get email -> verify.
    // I added validateTokenOnly(token) which returns identifier.
    // Let's use that.
    return "Not Implemented properly without identifier lookup";
  },

  // Revised approach for confirmEmail below in separate chunk or handled better.
  // Actually, I should update TokenService to allow verifying by token only if it's unique enough (uuid is).
  // Schema has composite PK (identifier, token). So same token COULD theoretically exist for diff users?
  // UUIDv4 is globally unique. So yes we can find by token.

  async verifyEmailWithToken(token: string) {
    const valid = await TokenService.validateTokenOnly(token);
    if (!valid || valid.error) throw new Error("Invalid or expired token");

    const email = valid.identifier!;

    // Update User
    await db.update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.email, email));

    // Consume token
    await TokenService.verifyToken(email, token);

    return { success: true, email };
  },

  async forgotPassword(email: string) {
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) return; // Silent fail for security? Or throw? Usually silent.

    const token = await TokenService.generateToken(email);
    await EmailService.sendPasswordResetEmail(email, user.name || 'User', token);
    return true;
  },

  async resetPassword(token: string, newPassword: string) {
    const valid = await TokenService.validateTokenOnly(token);
    if (!valid || valid.error) throw new Error("Invalid or expired token");

    const email = valid.identifier!;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, email));

    await TokenService.verifyToken(email, token); // Consume
    return true;
  },

  async setupTwoFactor(userId: string) {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) throw new Error("User not found");

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'BusinessOS', secret);
    const qrCode = await QRCode.toDataURL(otpauth);

    // Store secret temporarily or permanently? Usually permanently but unverified.
    // Or verified later.
    // We store it now.
    await db.update(users).set({ twoFactorSecret: secret }).where(eq(users.id, userId));

    return { secret, qrCode };
  },

  async confirmTwoFactor(userId: string, token: string) {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user || !user.twoFactorSecret) throw new Error("2FA setup not initiated");

    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) throw new Error("Invalid OTP code");

    await db.update(users).set({ twoFactorEnabled: true }).where(eq(users.id, userId));
    return true;
  },

  async verifyTwoFactorLogin(userId: string, token: string) {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) return false;
    return authenticator.verify({ token, secret: user.twoFactorSecret });
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

      // Properly cast team to expected type
      const team = invitation.team as InvitationTeam;

      return {
        user,
        team,
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
