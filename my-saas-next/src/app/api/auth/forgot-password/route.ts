// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: 'If an account exists, a reset link has been sent.' 
      });
    }

    // Generate reset token (dalam produksi, simpan di database dengan expiry)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // TODO: Simpan token di database (perlu tambah field di schema)
    // Untuk sementara, kita log saja
    console.log(`Password reset token for ${email}: ${resetToken}`);

    // TODO: Kirim email dengan link reset
    // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    // await sendEmail(email, 'Password Reset', `Click here: ${resetUrl}`);

    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists, a reset link has been sent.',
      // DEV ONLY - remove in production
      devToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
