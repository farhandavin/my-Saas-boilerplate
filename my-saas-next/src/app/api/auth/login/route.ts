
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, auditLogs, teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { email, password, teamId } = await req.json();

    // 1. Cari User beserta semua tim
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        teamMembers: {
          with: { team: true }
        }
      }
    });

    if (!user || !(await bcrypt.compare(password, user.password || ""))) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    // Filter members with valid teams
    const validMembers = user.teamMembers.filter(tm => tm.team);

    // 2. Tidak punya team sama sekali
    if (validMembers.length === 0) {
      return NextResponse.json({ error: "Tidak ada tim terkait akun ini" }, { status: 403 });
    }

    // 3. Jika user punya multiple teams dan belum pilih team
    if (validMembers.length > 1 && !teamId) {
      // Return teams list untuk dipilih
      return NextResponse.json({
        success: false,
        requireTeamSelection: true,
        teams: validMembers.map(tm => ({
          id: tm.team!.id,
          name: tm.team!.name,
          slug: tm.team!.slug,
          tier: tm.team!.tier,
          role: tm.role
        })),
        user: { name: user.name, email: user.email }
      });
    }

    // 4. Tentukan team yang aktif
    let activeMember = validMembers[0];

    if (teamId) {
      // User memilih team tertentu
      const selectedMember = validMembers.find(tm => tm.teamId === teamId);
      if (!selectedMember) {
        return NextResponse.json({ error: "Tim tidak ditemukan" }, { status: 403 });
      }
      activeMember = selectedMember;
    }

    // 5. Buat Token dengan role dari team yang dipilih
    const token = jwt.sign(
      {
        userId: user.id,
        teamId: activeMember.teamId,
        role: activeMember.role,
        isSuperAdmin: user.isSuperAdmin,
        email: user.email
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    // 6. Audit log
    await db.insert(auditLogs).values({
      teamId: activeMember.teamId,
      userId: user.id,
      action: 'LOGIN',
      entity: 'auth',
      details: `User logged in as ${activeMember.role}`
    });

    // 7. Set Cookie (HttpOnly) & Return Response
    const response = NextResponse.json({
      success: true,
      // token: token, // REMOVED: Use HttpOnly cookie instead
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image
      },
      team: {
        id: activeMember.team!.id,
        name: activeMember.team!.name,
        slug: activeMember.team!.slug,
        tier: activeMember.team!.tier
      },
      role: activeMember.role,
      // Include all teams untuk switch di dashboard
      allTeams: validMembers.map(tm => ({
        id: tm.team!.id,
        name: tm.team!.name,
        slug: tm.team!.slug,
        tier: tm.team!.tier,
        role: tm.role
      }))
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 hari
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: "Login gagal. Silakan coba lagi." }, { status: 500 });
  }
}