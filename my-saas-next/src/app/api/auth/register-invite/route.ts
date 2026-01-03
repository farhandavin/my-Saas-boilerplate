import { NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, inviteCode } = body;

    if (!name || !email || !password || !inviteCode) {
      return NextResponse.json(
        { success: false, error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const result = await AuthService.registerWithInvite({
      name,
      email,
      password,
      inviteCode
    });

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil dan bergabung ke tim",
      data: {
        userId: result.user.id,
        teamName: result.team.name,
        role: result.role
      }
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
