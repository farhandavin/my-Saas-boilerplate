import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Cari User
    const user = await prisma.user.findUnique({
      where: { email },
      include: { teamMembers: { include: { team: true } } } // Ambil info Tim
    });

    if (!user || !(await bcrypt.compare(password, user.password || ""))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 2. Ambil Tim Utama (Default team pertama)
    const activeMember = user.teamMembers[0];
    if (!activeMember) return NextResponse.json({ error: "No team found" }, { status: 403 });

    // 3. Buat Token
    const token = jwt.sign(
      {
        userId: user.id,
        teamId: activeMember.teamId,
        role: activeMember.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    // 4. Set Cookie (HttpOnly) & Return Response
    const response = NextResponse.json({
      success: true,
      token, // Untuk client-side storage jika perlu
      user: { name: user.name, email: user.email },
      team: activeMember.team
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 // 1 hari
    });

    return response;

  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}