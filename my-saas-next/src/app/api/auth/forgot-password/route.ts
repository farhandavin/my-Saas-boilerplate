
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, passwordResetTokens } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { EmailService } from '@/services/emailService';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase())
    });

    // Always return success to prevent email enumeration attacks
    if (user) {
      // Generate secure random token
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Token expires in 1 hour
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Invalidate any existing unused tokens for this user
      await db.update(passwordResetTokens)
        .set({ used: true })
        .where(and(
          eq(passwordResetTokens.userId, user.id),
          eq(passwordResetTokens.used, false)
        ));

      // Create new password reset token
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token: resetToken,
        expiresAt
      });

      // Send password reset email via Resend
      await EmailService.sendPasswordResetEmail(
        user.email,
        user.name || 'User',
        resetToken
      );

      // Email sent successfully (no logging for GDPR compliance)
    }

    // Always return success message (security best practice)
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.'
    });

  } catch (error) {
    console.error('[ForgotPassword] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
