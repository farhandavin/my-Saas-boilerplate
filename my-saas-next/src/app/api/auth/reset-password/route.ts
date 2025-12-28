// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, email, newPassword } = await req.json();

    if (!token || !email || !newPassword) {
      return NextResponse.json({ 
        error: 'Token, email, and new password are required' 
      }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters' 
      }, { status: 400 });
    }

    // TODO: Validasi token dari database
    // const storedToken = await prisma.passwordReset.findFirst({
    //   where: { token, email, expires: { gt: new Date() } }
    // });
    // if (!storedToken) return error

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid reset request' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // TODO: Delete used token
    // await prisma.passwordReset.delete({ where: { token } });

    // Audit log
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: user.id }
    });

    if (teamMember) {
      await prisma.auditLog.create({
        data: {
          teamId: teamMember.teamId,
          userId: user.id,
          action: 'PASSWORD_RESET',
          details: 'Password was reset via email recovery'
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password has been reset successfully' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
