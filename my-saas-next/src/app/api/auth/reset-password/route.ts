
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, passwordResetTokens, auditLogs, teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ 
        error: 'Token and new password are required' 
      }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters' 
      }, { status: 400 });
    }

    // Find and validate reset token
    const resetToken = await db.query.passwordResetTokens.findFirst({
        where: eq(passwordResetTokens.token, token),
        with: { user: true }
    });

    if (!resetToken) {
      return NextResponse.json({ 
        error: 'Invalid or expired reset token' 
      }, { status: 400 });
    }

    // Check if token has already been used
    if (resetToken.used) {
      return NextResponse.json({ 
        error: 'This reset link has already been used' 
      }, { status: 400 });
    }

    // Check if token has expired
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json({ 
        error: 'This reset link has expired. Please request a new one.' 
      }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and mark token as used (in a transaction)
    await db.transaction(async (tx) => {
        await tx.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, resetToken.userId));
        
        await tx.update(passwordResetTokens)
            .set({ used: true })
            .where(eq(passwordResetTokens.id, resetToken.id));
    });

    // Create audit log
    const member = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, resetToken.userId)
    });

    if (member) {
      await db.insert(auditLogs).values({
        teamId: member.teamId!,
        userId: resetToken.userId,
        action: 'PASSWORD_RESET',
        entity: 'Auth',
        details: 'Password was reset via email recovery'
      });
    }

    console.log(`[ResetPassword] Password reset successful for user: ${resetToken.user.email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Password has been reset successfully. You can now login with your new password.' 
    });

  } catch (error) {
    console.error('[ResetPassword] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to reset password' 
    }, { status: 500 });
  }
}
